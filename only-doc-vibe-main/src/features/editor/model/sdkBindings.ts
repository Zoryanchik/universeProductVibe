import { loadPdfLib } from "@/shared/lib/lazy-load/loadPdfLib";

import type { EditorExportSettings } from "./exportSettings";
import {
  buildBarCodeDataUrl,
  mapToJsBarcodeOptions,
  parseBarCodeState,
  type EditorBarCodeState,
} from "./barCode";
import {
  buildQRCodeDataUrl,
  mapOptionsToCodeOption,
  parseQRCodeState,
  type EditorQRCodeState,
} from "./qrCode";
import type { PDFEditorBarCodeOptions } from "./types";
import type {
  EditorElementShadow,
  EditorPageSettings,
  EditorSelectedElement,
  EditorStrokeLineJoin,
  PDFEditorInstance,
  PDFEditorQRCodeOptions,
} from "./types";

const WORKSPACE_IDS = new Set([
  "WorkSpaceDrawType",
  "WorkSpaceClipType",
  "WorkSpaceSafeType",
  "WorkSpaceMaskType",
  "WorkSpaceLineType",
]);

/** Material paths/lines from the SDK shape library — move/scale only, no rotation. */
const MATERIAL_SHAPE_TYPES = new Set(["path", "line", "polyline"]);

export const supportsElementRotation = (type: string): boolean => {
  const normalized = type.toLowerCase();

  return !MATERIAL_SHAPE_TYPES.has(normalized) && normalized !== "arctext";
};

/** SDK canvas backdrop — must stay transparent; page color lives on WorkSpaceDrawType.fill */
const CANVAS_BACKDROP = "rgba(255,255,255,0)";

/** Editor chrome around the page sheet (matches PdfEditorCanvas shell). */
const EDITOR_VIEWPORT_BG = "#2A2D33";

/** Fabric props required when persisting canvas → template (default toObject() drops `id`). */
const CANVAS_PERSIST_PROPERTIES = [
  "id",
  "name",
  "type",
  "left",
  "top",
  "width",
  "height",
  "scaleX",
  "scaleY",
  "angle",
  "fill",
  "stroke",
  "strokeWidth",
  "opacity",
  "visible",
  "selectable",
  "evented",
  "lockMovementX",
  "lockMovementY",
  "objectCaching",
  "shadow",
  "flipX",
  "flipY",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "underline",
  "linethrough",
  "textAlign",
  "lineHeight",
  "charSpacing",
  "textBackgroundColor",
  "curvature",
  "splitByGrapheme",
  "codeContent",
  "codeOption",
] as const;

const DEFAULT_ARC_CURVATURE = 151;

const normalizePageColor = (color: unknown): string => {
  if (typeof color !== "string" || !color.trim()) return "#ffffff";

  const value = color.trim().toLowerCase();

  if (value === "white") return "#ffffff";

  if (/^#[0-9a-f]{3}$/i.test(value)) {
    const [, r, g, b] = value;

    return `#${r}${r}${g}${g}${b}${b}`;
  }

  if (/^#[0-9a-f]{6}$/i.test(value)) return value;

  const match = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);

  if (!match) return "#ffffff";

  const toHex = (channel: string): string =>
    Number.parseInt(channel, 10).toString(16).padStart(2, "0");

  return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`;
};

const normalizeColor = (fill: unknown): string => {
  if (typeof fill !== "string") return "";

  return fill.replace(/\s/g, "").toLowerCase();
};

const fillsMatch = (a: unknown, b: unknown): boolean => {
  const left = normalizeColor(a);
  const right = normalizeColor(b);

  return Boolean(left && right && left === right);
};

const isLightPageFill = (fill: unknown): boolean => {
  const normalized = normalizeColor(fill);

  if (!normalized) return false;

  return (
    normalized === "#fff" ||
    normalized === "#ffffff" ||
    normalized === "white" ||
    normalized === "rgb(255,255,255)" ||
    normalized === "rgba(255,255,255,1)" ||
    normalized.startsWith("rgb(255,255,255")
  );
};

interface PageBounds {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

const getTemplateObjectBounds = (object: FabricObjectLike): PageBounds => ({
  left: object.left ?? 0,
  top: object.top ?? 0,
  width: (object.width ?? 0) * (object.scaleX ?? 1),
  height: (object.height ?? 0) * (object.scaleY ?? 1),
});

const getCanvasObjectBounds = (object: FabricObjectLike): PageBounds => ({
  left: object.left ?? 0,
  top: object.top ?? 0,
  width:
    object.getScaledWidth?.() ?? (object.width ?? 0) * (object.scaleX ?? 1),
  height:
    object.getScaledHeight?.() ?? (object.height ?? 0) * (object.scaleY ?? 1),
});

const coversPageArea = (
  objectBounds: PageBounds,
  page: PageBounds
): boolean => {
  if (page.width <= 0 || page.height <= 0) return false;

  return (
    objectBounds.width >= page.width * 0.85 &&
    objectBounds.height >= page.height * 0.85 &&
    objectBounds.left <= page.left + page.width * 0.1 &&
    objectBounds.top <= page.top + page.height * 0.1
  );
};

const isDiscoverablePageBackground = (
  object: FabricObjectLike,
  page: PageBounds,
  useCanvasMetrics: boolean,
  workspaceIndex: number,
  objectIndex: number
): boolean => {
  if (typeof object.id === "string" && WORKSPACE_IDS.has(object.id)) {
    return false;
  }

  const type = String(object.type ?? "").toLowerCase();
  if (type === "activeselection" || type === "group") return false;

  if (typeof object.fill !== "string") return false;

  const bounds = useCanvasMetrics
    ? getCanvasObjectBounds(object)
    : getTemplateObjectBounds(object);

  if (coversPageArea(bounds, page) && isLightPageFill(object.fill)) {
    return true;
  }

  return (
    workspaceIndex >= 0 &&
    objectIndex > workspaceIndex &&
    objectIndex <= workspaceIndex + 5 &&
    isLightPageFill(object.fill)
  );
};

const discoverPageBackgroundLayerIds = (
  objects: FabricObjectLike[],
  page: PageBounds,
  useCanvasMetrics: boolean
): string[] => {
  const workspaceIndex = objects.findIndex(
    (object) => object.id === "WorkSpaceDrawType"
  );
  const ids: string[] = [];

  objects.forEach((object, index) => {
    if (!object.id || object.id === "WorkSpaceDrawType") return;

    if (
      !isDiscoverablePageBackground(
        object,
        page,
        useCanvasMetrics,
        workspaceIndex,
        index
      )
    ) {
      return;
    }

    ids.push(object.id);
  });

  return ids;
};

const findTemplateWorkspace = (
  objects: FabricObjectLike[] | undefined
): FabricObjectLike | undefined =>
  objects?.find((object) => object.id === "WorkSpaceDrawType");

const applyBackgroundToTemplate = (
  template: TemplateLike,
  settings: EditorPageSettings
): void => {
  const workspace = findTemplateWorkspace(template.objects);
  if (!workspace) return;

  const zoom = template.zoom ?? 1;
  const workspaceWidth = settings.width / zoom;
  const workspaceHeight = settings.height / zoom;
  const background = normalizePageColor(settings.background);

  const page: PageBounds = {
    left: workspace.left ?? 0,
    top: workspace.top ?? 0,
    width: settings.width,
    height: settings.height,
  };

  template.background = CANVAS_BACKDROP;
  template.workSpace = {
    ...template.workSpace,
    fillType: 0,
    fill: background,
    color: background,
  };

  const objects = template.objects ?? [];
  const knownLayerIds = new Set(template.pageBackgroundLayerIds ?? []);

  if (knownLayerIds.size === 0) {
    const discovered = discoverPageBackgroundLayerIds(objects, page, false);
    template.pageBackgroundLayerIds = discovered;
    discovered.forEach((id) => knownLayerIds.add(id));
  }

  objects.forEach((object) => {
    if (object.id === "WorkSpaceDrawType") {
      object.width = workspaceWidth;
      object.height = workspaceHeight;
      object.fill = background;
      object.shadow = null;
      object.objectCaching = false;

      return;
    }

    if (!object.id || !knownLayerIds.has(object.id)) return;

    const previousFill = object.fill;
    object.fill = background;

    if (fillsMatch(object.stroke, previousFill)) {
      object.stroke = background;
    }
  });
};

const applyFillToObject = (
  object: FabricObjectLike,
  color: string,
  previousFill?: unknown
): void => {
  const priorFill = previousFill ?? object.fill;

  object.set?.({ fill: color, dirty: true, objectCaching: false });
  Object.assign(object, { fill: color, dirty: true, objectCaching: false });

  if (fillsMatch(object.stroke, priorFill)) {
    object.set?.({ stroke: color });
    Object.assign(object, { stroke: color });
  }
};

const applyBackgroundToCanvas = (
  canvas: FabricCanvasLike | null,
  settings: EditorPageSettings,
  template: TemplateLike | null | undefined
): void => {
  if (!canvas) return;

  const objects = canvas.getObjects?.() ?? [];
  const workspace = objects.find((object) => object.id === "WorkSpaceDrawType");
  if (!workspace) return;

  const zoom = template?.zoom ?? 1;
  const workspaceWidth = settings.width / zoom;
  const workspaceHeight = settings.height / zoom;
  const background = normalizePageColor(settings.background);

  const page: PageBounds = {
    left: workspace.left ?? 0,
    top: workspace.top ?? 0,
    width: settings.width,
    height: settings.height,
  };

  workspace.set?.({
    fill: background,
    shadow: null,
    width: workspaceWidth,
    height: workspaceHeight,
    dirty: true,
    objectCaching: false,
  });
  Object.assign(workspace, {
    fill: background,
    shadow: null,
    width: workspaceWidth,
    height: workspaceHeight,
    dirty: true,
    objectCaching: false,
  });
  workspace.setCoords?.();

  let knownLayerIds = new Set(template?.pageBackgroundLayerIds ?? []);

  if (knownLayerIds.size === 0) {
    const discovered = discoverPageBackgroundLayerIds(objects, page, true);
    knownLayerIds = new Set(discovered);

    if (template) {
      template.pageBackgroundLayerIds = discovered;
    }
  }

  const pageBackgroundLock = {
    selectable: false,
    evented: false,
    hasControls: false,
    hasBorders: false,
    lockMovementX: true,
    lockMovementY: true,
    lockRotation: true,
    lockScalingX: true,
    lockScalingY: true,
    lockUniScaling: true,
  };

  objects.forEach((object) => {
    if (!object.id || !knownLayerIds.has(object.id)) return;

    applyFillToObject(object, background, object.fill);
    object.set?.(pageBackgroundLock);
    Object.assign(object, pageBackgroundLock);
    object.setCoords?.();
  });

  const draw = objects.find((object) => object.id === "WorkSpaceDrawType");
  const mask = objects.find((object) => object.id === "WorkSpaceMaskType");
  const clip = objects.find((object) => object.id === "WorkSpaceClipType");
  const safe = objects.find((object) => object.id === "WorkSpaceSafeType");

  if (draw) canvas.sendObjectToBack?.(draw);

  if (mask) canvas.bringObjectToFront?.(mask);

  if (clip) canvas.bringObjectToFront?.(clip);

  if (safe) canvas.bringObjectToFront?.(safe);

  canvas.backgroundColor = EDITOR_VIEWPORT_BG;
  applyEditorViewportThemeToCanvas(canvas);
  canvas.requestRenderAll?.();
  canvas.renderAll?.();
};

const ROT_KEY = "__pageRotations" as const;

type UnknownRecord = Record<string, unknown>;
type RotationMap = Record<number, number>;

interface PiniaLike {
  _s?: Map<string, unknown>;
}

interface TemplatesStoreLike {
  templates?: TemplateLike[];
  templateIndex?: number;
  currentTemplate?: TemplateLike;
  setTemplates?: (templates: TemplateLike[]) => void;
  setTemplateIndex?: (index: number) => void;
  renderTemplate?: () => Promise<void> | void;
  renderElement?: () => Promise<void> | void;
  addTemplate?: (
    template?: TemplateLike | TemplateLike[],
    index?: number,
    keepCurrentIndex?: boolean
  ) => Promise<void> | void;
  deleteTemplate?: (id: string | string[]) => void;
  modifedElement?: () => void;
  setSize?: (width: number, height: number, zoom: number) => void;
  updateTemplate?: (props: Partial<TemplateLike>) => void;
}

interface FabricStoreLike {
  canvas?: FabricCanvasLike | null;
}

interface SnapshotStoreLike {
  canUndo?: boolean;
  canRedo?: boolean;
  unDo?: () => Promise<void> | void;
  reDo?: () => Promise<void> | void;
  initSnapshotDatabase?: () => Promise<void> | void;
}

interface TemplateLike {
  id?: string;
  width?: number;
  height?: number;
  zoom?: number;
  background?: string;
  backgroundImage?: unknown;
  objects?: FabricObjectLike[];
  workSpace?: UnknownRecord;
  /** IDs of PDF page backdrop layers discovered on first background apply */
  pageBackgroundLayerIds?: string[];
}

export interface FabricObjectLike extends UnknownRecord {
  id?: string;
  type?: string;
  name?: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  opacity?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeLineJoin?: string;
  flipX?: boolean;
  flipY?: boolean;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  underline?: boolean;
  linethrough?: boolean;
  textAlign?: string;
  lineHeight?: number;
  charSpacing?: number;
  textBackgroundColor?: string;
  curvature?: number;
  splitByGrapheme?: boolean;
  selectable?: boolean;
  evented?: boolean;
  lockMovementX?: boolean;
  lockMovementY?: boolean;
  hoverCursor?: string;
  defaultCursor?: string;
  codeContent?: string;
  codeOption?: unknown;
  scale?: (value: number) => void;
  setSrc?: (
    src: string,
    options?: { crossOrigin?: string }
  ) => Promise<unknown>;
  setElement?: (element: HTMLImageElement) => void;
  shadow?: unknown;
  clone?: (
    properties?: string[]
  ) => Promise<FabricObjectLike> | FabricObjectLike;
  set?: (props: Partial<FabricObjectLike>) => void;
  setCoords?: () => void;
  toObject?: (properties?: string[]) => UnknownRecord;
  getScaledWidth?: () => number;
  getScaledHeight?: () => number;
  originX?: "left" | "center" | "right";
  originY?: "top" | "center" | "bottom";
}

interface FabricCanvasLike {
  wrapperEl?: HTMLElement;
  backgroundColor?: string;
  viewportTransform?: number[];
  width?: number;
  height?: number;
  getElement?: () => HTMLCanvasElement;
  getCenter?: () => { left: number; top: number };
  viewportCenterObject?: (object: FabricObjectLike) => void;
  toObject?: (properties?: string[]) => UnknownRecord;
  getActiveObject?: () => FabricObjectLike | undefined;
  getActiveObjects?: () => FabricObjectLike[];
  getObjects?: () => FabricObjectLike[];
  setActiveObject?: (object: FabricObjectLike) => void;
  discardActiveObject?: () => void;
  renderAll?: () => void;
  requestRenderAll?: () => void;
  remove?: (...objects: FabricObjectLike[]) => void;
  add?: (...objects: FabricObjectLike[]) => void;
  bringObjectToFront?: (object: FabricObjectLike) => void;
  sendObjectToBack?: (object: FabricObjectLike) => void;
  bringObjectForward?: (object: FabricObjectLike) => void;
  sendObjectBackwards?: (object: FabricObjectLike) => void;
  setWidth?: (value: number) => void;
  setHeight?: (value: number) => void;
  getWidth?: () => number;
  getHeight?: () => number;
  getZoom?: () => number;
  relativePan?: (point: { readonly x: number; readonly y: number }) => void;
  zoomToPoint?: (
    point: { readonly x: number; readonly y: number },
    zoom: number
  ) => void;
  toDataURL?: (options?: {
    format?: "png" | "jpeg";
    quality?: number;
    multiplier?: number;
    width?: number;
    height?: number;
    left?: number;
    top?: number;
  }) => string;
  on?: (eventName: string, handler: (event: unknown) => void) => void;
  off?: (eventName: string, handler: (event: unknown) => void) => void;
  findTarget?: (event: PointerEvent) => FabricObjectLike | null | undefined;
}

interface WindowWithPinia extends Window {
  Pinia?: {
    setActivePinia?: (pinia: unknown) => void;
    activePinia?: PiniaLike;
    getActivePinia?: () => PiniaLike;
  };
}

interface VueGlobal {
  toRaw?: <T>(value: T) => T;
  isRef?: (value: unknown) => boolean;
  isReactive?: (value: unknown) => boolean;
}

interface WindowWithVue extends Window {
  Vue?: VueGlobal;
}

interface MainStoreLike {
  canvasObject?: FabricObjectLike;
}

interface FabricCanvasWithActiveRef extends FabricCanvasLike {
  activeObject?: { value?: FabricObjectLike };
  _activeObject?: FabricObjectLike;
}

const CANVAS_PATCH_FLAG = "__onlyDocResizePatched";

const getVue = (): VueGlobal | undefined => {
  if (typeof window === "undefined") return undefined;

  return (window as WindowWithVue).Vue;
};

/**
 * Unwraps the Vue reactive proxy around a fabric value. The SDK stores the
 * canvas in a Pinia store, which causes Vue to wrap it in a reactive() proxy.
 * Reading mutable properties through the proxy returns reactive sub-proxies
 * and (worse) auto-unwraps refs — both of which break Fabric's selection
 * machinery. Always operate on the raw object instead.
 */
const toRawCanvas = <T>(value: T): T => {
  const toRaw = getVue()?.toRaw;

  return toRaw ? toRaw(value) : value;
};

/**
 * Re-points every object's `canvas` reference at the raw canvas (not the
 * reactive proxy). Fabric's hit-detection (`Control.shouldActivate`) compares
 * `target.canvas.getActiveObject() === target`, but when `target.canvas` is the
 * reactive proxy, `getActiveObject()` returns a reactive wrapper that fails
 * the identity check — so resize/rotate handles never activate.
 */
const repointObjectCanvasRefs = (
  rawCanvas: FabricCanvasLike,
  objects: readonly FabricObjectLike[]
): void => {
  objects.forEach((object) => {
    if (!object) return;

    const raw = toRawCanvas(object) as FabricObjectLike & {
      canvas?: FabricCanvasLike;
      _objects?: FabricObjectLike[];
    };

    if (raw.canvas !== rawCanvas) {
      raw.canvas = rawCanvas;
    }

    if (Array.isArray(raw._objects) && raw._objects.length > 0) {
      repointObjectCanvasRefs(rawCanvas, raw._objects);
    }
  });
};

/**
 * Applies a one-time compatibility patch that lets Fabric's selection/control
 * system survive the Pinia reactive() wrapping the SDK applies to its canvas.
 *
 * The SDK stores `activeObject` on the canvas as a Vue `shallowRef()` and then
 * exposes `_activeObject` via a getter/setter that reads/writes
 * `this.activeObject.value`. Pinia wraps the canvas in `reactive()`, which
 * auto-unwraps refs on property access — so `this.activeObject` evaluates to
 * `undefined` and the getter/setter silently no-op. Result: clicks never
 * register an active object, controls aren't drawn, and resize handles don't
 * respond to clicks (move still works because Fabric drags the target hit by
 * `findTarget`, not the active object).
 *
 * We swap the ref with a plain `{value: …}` holder so the proxy returns it
 * untouched, restoring the canonical getter/setter contract. We also walk the
 * scene so each object's `canvas` reference points at the raw canvas — the
 * `Control.shouldActivate` identity check (`target.canvas.getActiveObject()
 * === target`) otherwise compares against a reactive wrapper and fails.
 */
const ensureCanvasResizePatched = (
  canvas: FabricCanvasLike
): FabricCanvasLike => {
  const rawCanvas = toRawCanvas(canvas) as FabricCanvasLike & {
    [CANVAS_PATCH_FLAG]?: boolean;
    activeObject?: { value?: FabricObjectLike };
    on?: (eventName: string, handler: (event: unknown) => void) => void;
  };

  if (rawCanvas[CANVAS_PATCH_FLAG]) return rawCanvas;

  // 1. Swap the Vue shallowRef with a plain holder the proxy can pass through.
  const previousValue =
    (rawCanvas.activeObject &&
      (rawCanvas.activeObject as { value?: FabricObjectLike }).value) ||
    undefined;
  rawCanvas.activeObject = { value: previousValue };

  // 2. Re-point existing objects' canvas refs at the raw canvas.
  repointObjectCanvasRefs(rawCanvas, rawCanvas.getObjects?.() ?? []);

  // 3. Re-point new objects' canvas refs as they get added (covers undo/redo
  // reload and page switches that recreate the scene via loadFromJSON).
  const rebindOnAdd = (event: unknown): void => {
    const target = (event as { target?: FabricObjectLike })?.target;
    if (!target) return;

    repointObjectCanvasRefs(rawCanvas, [target]);
  };

  rawCanvas.on?.("object:added", rebindOnAdd);

  rawCanvas[CANVAS_PATCH_FLAG] = true;

  return rawCanvas;
};

const SELECTION_POLL_MS = 150;

interface EditorHistorySnapshot {
  readonly index: number;
  readonly templates: TemplateLike[];
  /** Per-page canvas preview rotation (0/90/180/270), keyed by page index. */
  readonly pageRotations?: RotationMap;
}

export interface EditorHistoryRunResult {
  readonly pageCount: number;
  readonly currentPage: number;
  readonly previousPageCount: number;
}

export const EDITOR_HISTORY_RESTORED_EVENT =
  "pdf-editor:history-restored" as const;
export const PAGE_THUMBNAIL_UPDATE_EVENT =
  "pdf-editor:page-thumbnail-update" as const;
export const EDITOR_FOCUS_ELEMENT_PANEL_EVENT =
  "pdf-editor:focus-element-panel" as const;

export interface PageThumbnailUpdateDetail {
  readonly page: number;
}

const THUMBNAIL_UPDATE_DEBOUNCE_MS = 600;
let pendingThumbnailUpdateTimer: ReturnType<typeof setTimeout> | undefined;
let pendingThumbnailUpdatePage: number | null = null;

interface EditorHistoryState {
  cursor: number;
  snapshots: EditorHistorySnapshot[];
  isRestoring: boolean;
}

export interface EditorPageThumbnail {
  readonly page: number;
  readonly dataUrl: string;
}

const HISTORY_KEY = "__editorLocalHistory" as const;
const PREVIEW_KEY = "__editorPropertyPreview" as const;
const HISTORY_DEBOUNCE_MS = 500;
const HISTORY_NAV_COOLDOWN_MS = 1000;

let cancelPendingCanvasHistory: (() => void) | null = null;
let historyNavigationDepth = 0;
let historyNavigationCooldownUntil = 0;
const postHistoryThumbnailJobs: Array<() => void> = [];

export const isEditorHistoryNavigation = (): boolean =>
  historyNavigationDepth > 0 || Date.now() < historyNavigationCooldownUntil;

const beginHistoryNavigation = (): void => {
  historyNavigationDepth += 1;
};

const endHistoryNavigation = (): void => {
  historyNavigationDepth = Math.max(0, historyNavigationDepth - 1);

  if (historyNavigationDepth > 0) return;

  historyNavigationCooldownUntil = Date.now() + HISTORY_NAV_COOLDOWN_MS;

  window.setTimeout(() => {
    const jobs = postHistoryThumbnailJobs.splice(0);
    jobs.forEach((job) => job());
  }, HISTORY_NAV_COOLDOWN_MS);
};

export const queuePostHistoryThumbnailCapture = (job: () => void): void => {
  if (isEditorHistoryNavigation()) {
    postHistoryThumbnailJobs.push(job);

    return;
  }

  job();
};

const dispatchPageThumbnailUpdate = (page: number): void => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<PageThumbnailUpdateDetail>(PAGE_THUMBNAIL_UPDATE_EVENT, {
      detail: { page },
    })
  );
};

/** Debounced signal for the pages sidebar to refresh a page miniature after edits. */
export const schedulePageThumbnailUpdate = (
  instance: PDFEditorInstance | null,
  pageNumber?: number
): void => {
  if (!instance || isEditorPropertyPreview(instance)) return;

  const history = getHistoryState(instance);
  if (history?.isRestoring) return;

  const page = pageNumber ?? getCurrentPageFromStore(instance);
  pendingThumbnailUpdatePage = page;

  if (pendingThumbnailUpdateTimer) {
    clearTimeout(pendingThumbnailUpdateTimer);
  }

  pendingThumbnailUpdateTimer = setTimeout(() => {
    pendingThumbnailUpdateTimer = undefined;
    const targetPage = pendingThumbnailUpdatePage;
    pendingThumbnailUpdatePage = null;

    if (!targetPage) return;

    queuePostHistoryThumbnailCapture(() => {
      dispatchPageThumbnailUpdate(targetPage);
    });
  }, THUMBNAIL_UPDATE_DEBOUNCE_MS);
};

export const PAGE_THUMBNAIL_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160'%3E%3Crect width='100%25' height='100%25' fill='%233a3d44'/%3E%3C/svg%3E";

/**
 * Dispatched by the SDK (see its `loadPDF`) as a background page finishes
 * processing (`detail: { pageIndex, pageCount }`), and once all pages are done
 * (`PDF_EDITOR_ALL_PAGES_LOADED_EVENT`). Large PDFs load page 1 immediately and
 * stream the rest, so the FE listens to progressively refresh thumbnails.
 */
export const PDF_EDITOR_PAGE_LOADED_EVENT = "pdf-editor:page-loaded";
export const PDF_EDITOR_ALL_PAGES_LOADED_EVENT = "pdf-editor:all-pages-loaded";

/**
 * Dispatched by the SDK (continuous mode) when a touch pinch gesture changes the
 * page-column zoom (`detail: { zoom }`), so the embedder's zoom indicator can
 * follow the gesture live.
 */
export const PDF_EDITOR_ZOOM_CHANGED_EVENT = "pdf-editor:zoom-changed";

/** Detects an SDK placeholder template inserted for a not-yet-processed page. */
export const isLoadingPlaceholderTemplate = (template: unknown): boolean => {
  const record = template as UnknownRecord | null;
  if (!record) return false;

  return (
    record.isLoading === true ||
    String(record.id ?? "").startsWith("loading-placeholder")
  );
};

const debounceTrailing = <T extends (...args: never[]) => void>(
  fn: T,
  waitMs: number
): T & { cancel: () => void } => {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const debounced = ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, waitMs);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timer) clearTimeout(timer);

    timer = undefined;
  };

  return debounced;
};

export interface UpdateSelectedElementOptions {
  /** When false, only repaint canvas — skip template sync and history. */
  readonly persist?: boolean;
}

export const setEditorPropertyPreview = (
  instance: PDFEditorInstance | null,
  active: boolean
): void => {
  if (!instance) return;

  (instance as unknown as UnknownRecord)[PREVIEW_KEY] = active;
};

const isEditorPropertyPreview = (instance: PDFEditorInstance | null): boolean =>
  Boolean(
    instance && (instance as unknown as UnknownRecord)[PREVIEW_KEY] === true
  );

const waitForRenderFrame = (): Promise<void> =>
  new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();

      return;
    }

    window.requestAnimationFrame(() => resolve());
  });

const waitForCanvasReady = async (
  canvas: FabricCanvasLike | null
): Promise<void> => {
  canvas?.requestRenderAll?.();
  canvas?.renderAll?.();
  await waitForRenderFrame();
  await waitForRenderFrame();
};

const getPinia = (instance: PDFEditorInstance | null): PiniaLike | null => {
  if (!instance) return null;

  const bag = instance as unknown as { pinia?: PiniaLike };
  if (bag.pinia?._s) return bag.pinia;

  if (typeof window !== "undefined") {
    const piniaApi = (window as WindowWithPinia).Pinia;
    const active =
      piniaApi?.activePinia ?? piniaApi?.getActivePinia?.() ?? null;

    if (active?._s) return active;
  }

  return null;
};

const activatePinia = (instance: PDFEditorInstance | null): void => {
  const pinia = getPinia(instance);
  if (!pinia || typeof window === "undefined") return;

  (window as WindowWithPinia).Pinia?.setActivePinia?.(pinia);
};

export const callSdk = <T = void>(
  instance: PDFEditorInstance | null,
  method: keyof PDFEditorInstance,
  ...args: unknown[]
): T | undefined => {
  if (!instance) return undefined;

  const fn = (instance as unknown as UnknownRecord)[method as string];
  if (typeof fn !== "function") return undefined;

  try {
    return (fn as (...a: unknown[]) => T).apply(instance, args);
  } catch (err) {
    console.error(`[sdk] ${String(method)} failed`, err);

    return undefined;
  }
};

/**
 * Active rendering layout of the underlying SDK. In 'continuous' mode all pages
 * are stacked in a native scroll column (each an interactive canvas) and the SDK
 * owns scrolling/paging/zoom, so the FE must avoid the single-canvas viewport
 * manipulation used in 'single' mode.
 */
export const getEditorLayout = (
  instance: PDFEditorInstance | null
): "single" | "continuous" =>
  callSdk<"single" | "continuous">(instance, "getLayout") ?? "single";

const isContinuousLayout = (instance: PDFEditorInstance | null): boolean =>
  getEditorLayout(instance) === "continuous";

const getStore = <T>(
  instance: PDFEditorInstance | null,
  ids: string[],
  shapeCheck?: (store: unknown) => boolean
): T | null => {
  const map = getPinia(instance)?._s;
  if (!map) return null;

  for (const id of ids) {
    const store = map.get(id);
    if (store) return store as T;
  }

  if (shapeCheck) {
    for (const store of map.values()) {
      if (shapeCheck(store)) return store as T;
    }
  }

  return null;
};

export const getTemplatesStore = (
  instance: PDFEditorInstance | null
): TemplatesStoreLike | null =>
  getStore<TemplatesStoreLike>(
    instance,
    ["Templates", "templates", "TemplatesStore", "templateStore"],
    (store) =>
      typeof store === "object" &&
      store !== null &&
      "templates" in store &&
      "templateIndex" in store
  );

const getFabricStore = (
  instance: PDFEditorInstance | null
): FabricStoreLike | null =>
  getStore<FabricStoreLike>(
    instance,
    ["fabricStore", "fabric", "FabricStore"],
    (store) => typeof store === "object" && store !== null && "canvas" in store
  );

const getSnapshotStore = (
  instance: PDFEditorInstance | null
): SnapshotStoreLike | null =>
  getStore<SnapshotStoreLike>(
    instance,
    ["snapshot", "Snapshot", "snapshotStore", "SnapshotStore"],
    (store) =>
      typeof store === "object" &&
      store !== null &&
      ("unDo" in store || "reDo" in store)
  );

export const getFabricCanvas = (
  instance: PDFEditorInstance | null
): FabricCanvasLike | null => {
  let canvas = callSdk<FabricCanvasLike | null>(instance, "getCanvas");

  if (!canvas) {
    activatePinia(instance);
    canvas = getFabricStore(instance)?.canvas ?? null;
  }

  if (!canvas) return null;

  return ensureCanvasResizePatched(canvas);
};

const getMainStore = (
  instance: PDFEditorInstance | null
): MainStoreLike | null =>
  getStore<MainStoreLike>(
    instance,
    ["main", "MainStore"],
    (store) =>
      typeof store === "object" && store !== null && "canvasObject" in store
  );

/** Writes the live Fabric canvas into the current template page (no history entry). */
const persistCanvasToCurrentTemplate = (
  instance: PDFEditorInstance | null
): void => {
  activatePinia(instance);
  const store = getTemplatesStore(instance);
  const canvas = getFabricCanvas(instance);
  const templates = store?.templates;
  const index = store?.templateIndex ?? 0;

  if (!store || !canvas?.toObject || !templates?.[index]) return;

  const canvasJson = canvas.toObject([...CANVAS_PERSIST_PROPERTIES]) as {
    objects?: TemplateLike["objects"];
    background?: string;
    backgroundImage?: unknown;
  };

  const page = templates[index];
  page.objects = canvasJson.objects ?? page.objects;
  page.background = canvasJson.background ?? page.background;
  page.backgroundImage = canvasJson.backgroundImage ?? page.backgroundImage;
};

const syncTemplate = (instance: PDFEditorInstance | null): void => {
  persistCanvasToCurrentTemplate(instance);
  recordHistorySnapshot(instance);
  schedulePageThumbnailUpdate(instance);
};

const cloneTemplates = (templates: TemplateLike[]): TemplateLike[] =>
  JSON.parse(JSON.stringify(templates)) as TemplateLike[];

const getHistoryState = (
  instance: PDFEditorInstance | null
): EditorHistoryState | null => {
  if (!instance) return null;

  const bag = instance as unknown as UnknownRecord;

  if (!bag[HISTORY_KEY]) {
    bag[HISTORY_KEY] = {
      cursor: -1,
      snapshots: [],
      isRestoring: false,
    } satisfies EditorHistoryState;
  }

  return bag[HISTORY_KEY] as EditorHistoryState;
};

const cloneRotationMapForSnapshot = (
  rotations: RotationMap,
  pageCount: number
): RotationMap => {
  const next: RotationMap = {};

  for (const [key, value] of Object.entries(rotations)) {
    const index = Number(key);
    if (index >= 0 && index < pageCount) {
      next[index] = value;
    }
  }

  return next;
};

const restoreRotationMap = (
  instance: PDFEditorInstance,
  rotations: RotationMap | undefined,
  pageCount: number
): void => {
  const bag = getRotations(instance);

  for (const key of Object.keys(bag)) {
    delete bag[Number(key)];
  }

  if (!rotations) return;

  for (const [key, value] of Object.entries(rotations)) {
    const index = Number(key);
    if (index >= 0 && index < pageCount) {
      bag[index] = value;
    }
  }
};

export const recordHistorySnapshot = (
  instance: PDFEditorInstance | null
): void => {
  if (!instance) return;

  const store = getTemplatesStore(instance);
  const history = getHistoryState(instance);
  const templates = store?.templates;

  if (!store || !history || !templates || history.isRestoring) return;

  const pageCount = templates.length;
  const snapshot: EditorHistorySnapshot = {
    index: store.templateIndex ?? 0,
    templates: cloneTemplates(templates),
    pageRotations: cloneRotationMapForSnapshot(
      getRotations(instance),
      pageCount
    ),
  };
  const encoded = JSON.stringify(snapshot);
  const current = history.snapshots[history.cursor];

  if (current && JSON.stringify(current) === encoded) return;

  history.snapshots = history.snapshots.slice(0, history.cursor + 1);
  history.snapshots.push(snapshot);

  if (history.snapshots.length > 50) {
    history.snapshots.shift();
  }

  history.cursor = history.snapshots.length - 1;
};

/** Hide canvas while running work that re-renders other pages (history undo/redo). */
const runWithCanvasHidden = async (
  instance: PDFEditorInstance | null,
  work: () => Promise<void>
): Promise<void> => {
  const wrapper = getActiveCanvasWrapper(instance);
  if (!wrapper) {
    await work();

    return;
  }

  const previousPointerEvents = wrapper.style.pointerEvents;

  wrapper.style.visibility = "hidden";
  wrapper.style.pointerEvents = "none";

  try {
    await work();
    await waitForRenderFrame();
    await waitForRenderFrame();
  } finally {
    // Always restore to visible to avoid reentrancy where a nested capture
    // grabbed the already-hidden state and re-applied it on its own restore.
    wrapper.style.visibility = "";
    wrapper.style.pointerEvents = previousPointerEvents || "";
  }
};

const clearCanvasSelection = (instance: PDFEditorInstance | null): void => {
  if (!instance) return;

  activatePinia(instance);
  const mainStore = getMainStore(instance);
  if (mainStore && "setCanvasObject" in mainStore) {
    (
      mainStore as { setCanvasObject: (value: undefined) => void }
    ).setCanvasObject(undefined);
  }

  const canvas = getFabricCanvas(instance);
  if (!canvas) return;

  canvas.discardActiveObject?.();

  const canvasWithRef = canvas as FabricCanvasWithActiveRef;
  canvasWithRef._activeObject = undefined;
  if (canvasWithRef.activeObject) {
    canvasWithRef.activeObject.value = undefined;
  }

  canvas.requestRenderAll?.();
};

const finishHistorySync = (
  instance: PDFEditorInstance | null,
  previousPageCount: number
): EditorHistoryRunResult | null => {
  if (!instance) return null;

  clearCanvasSelection(instance);

  const pageCount = getTemplatePageCount(instance);
  const currentPage = getCurrentPageFromStore(instance);
  const detail: EditorHistoryRunResult = {
    pageCount,
    currentPage,
    previousPageCount,
  };

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(EDITOR_HISTORY_RESTORED_EVENT, { detail })
    );
  }

  return detail;
};

const restoreHistorySnapshot = async (
  instance: PDFEditorInstance | null,
  snapshot: EditorHistorySnapshot
): Promise<void> => {
  const store = getTemplatesStore(instance);
  const history = getHistoryState(instance);

  if (!store || !history || !instance) return;

  history.isRestoring = true;

  try {
    // Snapshots recorded while a large PDF was still streaming captured
    // `isLoading` placeholders for pages that hadn't arrived yet. Restoring those
    // verbatim would strand every such page on "Loading" forever (background
    // streaming already finished and won't re-run). Substitute the now-loaded
    // live template for any placeholder slot so undo/redo never resurrects one.
    const liveTemplates = (store.templates ?? []) as TemplateLike[];
    const templates = cloneTemplates(snapshot.templates).map(
      (template, index) => {
        const live = liveTemplates[index];
        if (
          isLoadingPlaceholderTemplate(template) &&
          live &&
          !isLoadingPlaceholderTemplate(live)
        ) {
          return cloneTemplate(live);
        }

        return template;
      }
    );
    const pageCount = templates.length;
    const nextIndex = Math.min(
      Math.max(0, snapshot.index),
      Math.max(0, pageCount - 1)
    );

    restoreRotationMap(instance, snapshot.pageRotations, pageCount);

    if (store.setTemplates) {
      store.setTemplates(templates);
    } else {
      store.templates = templates;
    }

    store.setTemplateIndex?.(nextIndex);
    if (!store.setTemplateIndex) {
      store.templateIndex = nextIndex;
    }

    await store.renderTemplate?.();
    clearCanvasSelection(instance);
  } finally {
    await new Promise<void>((resolve) => {
      // Keep isRestoring true until Fabric finishes loadFromJSON (object:modified
      // would otherwise overwrite the restored multi-page templates array).
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          history.isRestoring = false;
          clearCanvasSelection(instance);
          resolve();
        });
      });
    });
  }
};

export const canUndoHistory = (instance: PDFEditorInstance | null): boolean => {
  const history = getHistoryState(instance);
  if (history) return history.cursor > 0;

  return Boolean(getSnapshotStore(instance)?.canUndo);
};

export const canRedoHistory = (instance: PDFEditorInstance | null): boolean => {
  const history = getHistoryState(instance);
  if (history) {
    return history.cursor < history.snapshots.length - 1;
  }

  return Boolean(getSnapshotStore(instance)?.canRedo);
};

const isWorkspaceObject = (object: FabricObjectLike): boolean =>
  typeof object.id === "string" && WORKSPACE_IDS.has(object.id);

const normalizeActiveObject = (
  object: FabricObjectLike | null | undefined
): FabricObjectLike | null => {
  if (!object) return null;

  const type = String(object.type ?? "").toLowerCase();

  if (type === "activeselection" || type === "group") {
    const children =
      (object as { getObjects?: () => FabricObjectLike[] }).getObjects?.() ??
      [];

    return children.find((child) => !isWorkspaceObject(child)) ?? object;
  }

  return object;
};

const resolveCanvasActiveObject = (
  canvas: FabricCanvasLike
): FabricObjectLike | null => {
  const canvasWithRef = canvas as FabricCanvasWithActiveRef;
  let active =
    canvas.getActiveObject?.() ??
    canvasWithRef._activeObject ??
    canvasWithRef.activeObject?.value ??
    canvas.getActiveObjects?.()[0] ??
    null;

  active = normalizeActiveObject(active);

  if (!active || isWorkspaceObject(active)) return null;

  return active;
};

const getActiveObject = (
  instance: PDFEditorInstance | null
): FabricObjectLike | null => {
  if (!instance) return null;

  if (isEditorHistoryNavigation()) return null;

  const history = getHistoryState(instance);
  if (history?.isRestoring) return null;

  activatePinia(instance);

  const fromMainStore = normalizeActiveObject(
    getMainStore(instance)?.canvasObject
  );

  if (fromMainStore && !isWorkspaceObject(fromMainStore)) {
    return fromMainStore;
  }

  const canvas = getFabricCanvas(instance);
  if (!canvas) return null;

  return resolveCanvasActiveObject(canvas);
};

const DEFAULT_SHADOW: EditorElementShadow = {
  color: "#000000",
  blur: 5,
  offsetX: 1,
  offsetY: 1,
};

interface FabricShadowLike {
  color?: string;
  blur?: number;
  offsetX?: number;
  offsetY?: number;
  affectStroke?: boolean;
  nonScaling?: boolean;
}

const parseFabricShadow = (shadow: unknown): EditorElementShadow | null => {
  if (!shadow || typeof shadow !== "object") return null;

  const value = shadow as FabricShadowLike;

  return {
    color: typeof value.color === "string" ? value.color : DEFAULT_SHADOW.color,
    blur: typeof value.blur === "number" ? value.blur : DEFAULT_SHADOW.blur,
    offsetX:
      typeof value.offsetX === "number"
        ? value.offsetX
        : DEFAULT_SHADOW.offsetX,
    offsetY:
      typeof value.offsetY === "number"
        ? value.offsetY
        : DEFAULT_SHADOW.offsetY,
  };
};

const normalizeStrokeLineJoin = (
  value: string | undefined
): EditorStrokeLineJoin => {
  if (value === "round" || value === "bevel") return value;

  return "miter";
};

const isStrokeEnabled = (
  stroke: string | undefined,
  strokeWidth: number | undefined
): boolean => {
  if (!strokeWidth || strokeWidth <= 0) return false;

  if (!stroke || stroke === "transparent") return false;

  return true;
};

export const buildFabricShadow = (
  shadow: EditorElementShadow
): FabricShadowLike => ({
  color: shadow.color,
  blur: shadow.blur,
  offsetX: shadow.offsetX,
  offsetY: shadow.offsetY,
  affectStroke: false,
  nonScaling: false,
});

const buildSelectedElement = (
  object: FabricObjectLike | null
): EditorSelectedElement | null => {
  if (!object || isWorkspaceObject(object)) return null;

  const fabricType = String(object.type ?? "element");
  const displayName = String(object.name?.trim() ? object.name : fabricType);
  const scaledWidth = object.getScaledWidth?.() ?? object.width ?? 0;
  const scaledHeight = object.getScaledHeight?.() ?? object.height ?? 0;
  const normalizedType = fabricType.toLowerCase();
  const parsedShadow = parseFabricShadow(object.shadow);
  const strokeWidth = object.strokeWidth ?? 0;
  const stroke = typeof object.stroke === "string" ? object.stroke : undefined;
  const isQRCode =
    normalizedType === "qrcode" ||
    normalizedType === "qr-code" ||
    String(object.name ?? "").toLowerCase() === "qrcode";
  const isBarCode =
    normalizedType === "barcode" ||
    normalizedType === "bar-code" ||
    String(object.name ?? "").toLowerCase() === "barcode";

  return {
    id: object.id ?? null,
    type: fabricType,
    label: displayName.replace(/([a-z])([A-Z])/g, "$1 $2"),
    supportsRotation: supportsElementRotation(normalizedType),
    isArcText: normalizedType === "arctext",
    isText:
      normalizedType === "arctext" ||
      normalizedType.includes("text") ||
      normalizedType.includes("textbox") ||
      normalizedType.includes("itext"),
    isImage: normalizedType.includes("image"),
    isQRCode,
    isBarCode,
    isLocked: Boolean(object.lockMovementX && object.lockMovementY),
    left: Math.round(object.left ?? 0),
    top: Math.round(object.top ?? 0),
    width: Math.round(scaledWidth),
    height: Math.round(scaledHeight),
    rotation: Math.round(object.angle ?? 0),
    opacity: object.opacity ?? 1,
    flipX: Boolean(object.flipX),
    flipY: Boolean(object.flipY),
    fill: typeof object.fill === "string" ? object.fill : undefined,
    stroke,
    strokeWidth,
    strokeEnabled: isStrokeEnabled(stroke, strokeWidth),
    strokeLineJoin: normalizeStrokeLineJoin(object.strokeLineJoin),
    shadowEnabled: parsedShadow !== null,
    shadow: parsedShadow ?? DEFAULT_SHADOW,
    fontFamily: object.fontFamily,
    fontSize: object.fontSize,
    fontWeight: object.fontWeight,
    fontStyle: object.fontStyle,
    underline: object.underline,
    linethrough: object.linethrough,
    textAlign: object.textAlign,
    lineHeight: object.lineHeight,
    charSpacing: object.charSpacing,
    textBackgroundColor:
      typeof object.textBackgroundColor === "string"
        ? object.textBackgroundColor
        : undefined,
    curvature:
      typeof object.curvature === "number" ? object.curvature : undefined,
    qrCode: isQRCode ? parseQRCodeState(object) : undefined,
    barCode: isBarCode ? parseBarCodeState(object) : undefined,
  };
};

type FabricTextClass = new (
  text: string,
  options?: Record<string, unknown>
) => FabricObjectLike;

interface PdfEditorSdkExports {
  ArcText?: FabricTextClass;
  Textbox?: FabricTextClass;
}

const getFabricTextClass = (name: string): FabricTextClass | null => {
  const sdk = (window as Window & { PDFEditorSDK?: PdfEditorSdkExports })
    .PDFEditorSDK;

  if (name === "ArcText" && sdk?.ArcText) {
    return sdk.ArcText;
  }

  if ((name === "Textbox" || name === "textbox") && sdk?.Textbox) {
    return sdk.Textbox;
  }

  const registry = (
    window as Window & {
      fabric?: {
        classRegistry?: {
          getClass: (type: string) => FabricTextClass;
        };
      };
    }
  ).fabric?.classRegistry;

  if (!registry) return null;

  return (
    registry.getClass(name) ?? registry.getClass(name.toLowerCase()) ?? null
  );
};

const isArcTextObject = (object: FabricObjectLike): boolean =>
  String(object.type ?? "").toLowerCase() === "arctext";

const isEditableTextObject = (object: FabricObjectLike): boolean => {
  const type = String(object.type ?? "").toLowerCase();

  if (isArcTextObject(object)) return true;

  return (
    type.includes("text") ||
    type === "textbox" ||
    type === "i-text" ||
    type === "itext"
  );
};

const serializeTextObject = (
  object: FabricObjectLike
): Record<string, unknown> => {
  const raw = toRawCanvas(object) as FabricObjectLike & {
    toObject?: (props?: string[]) => Record<string, unknown>;
  };

  return raw.toObject?.([...CANVAS_PERSIST_PROPERTIES]) ?? { ...raw };
};

const replaceCanvasTextObject = (
  instance: PDFEditorInstance | null,
  canvas: FabricCanvasLike,
  previous: FabricObjectLike,
  next: FabricObjectLike
): EditorSelectedElement | null => {
  const rawCanvas = toRawCanvas(canvas);
  const rawPrevious = toRawCanvas(previous);
  const rawNext = toRawCanvas(next);

  rawCanvas.discardActiveObject?.();
  rawCanvas.remove?.(rawPrevious);
  rawCanvas.add?.(rawNext);
  rawCanvas.bringObjectToFront?.(rawNext);
  rawCanvas.setActiveObject?.(rawNext);
  rawNext.setCoords?.();
  rawCanvas.requestRenderAll?.();
  rawCanvas.renderAll?.();

  syncTemplate(instance);
  recordHistorySnapshot(instance);
  callSdk(instance, "refreshSelectionControls");

  return buildSelectedElement(rawNext);
};

const convertPlainTextToArcText = (
  instance: PDFEditorInstance | null,
  active: FabricObjectLike,
  canvas: FabricCanvasLike
): EditorSelectedElement | null => {
  const ArcTextClass = getFabricTextClass("ArcText");

  if (!ArcTextClass) {
    console.warn("[editor] ArcText is not available in the Fabric registry");

    return null;
  }

  const snapshot = serializeTextObject(active);
  const text =
    typeof snapshot.text === "string" && snapshot.text.length > 0
      ? snapshot.text
      : "Text";

  const arcOptions: Record<string, unknown> = {
    ...snapshot,
    curvature:
      typeof snapshot.curvature === "number"
        ? snapshot.curvature
        : DEFAULT_ARC_CURVATURE,
    hasControls: true,
    hasBorders: true,
    selectable: true,
    evented: true,
  };

  delete arcOptions.type;

  const arcText = new ArcTextClass(text, arcOptions);
  arcText.setCoords?.();

  return replaceCanvasTextObject(instance, canvas, active, arcText);
};

const convertArcTextToPlainText = (
  instance: PDFEditorInstance | null,
  active: FabricObjectLike,
  canvas: FabricCanvasLike
): EditorSelectedElement | null => {
  const TextboxClass =
    getFabricTextClass("Textbox") ?? getFabricTextClass("textbox");

  if (!TextboxClass) {
    console.warn("[editor] Textbox is not available in the Fabric registry");

    return null;
  }

  const snapshot = serializeTextObject(active);
  const text =
    typeof snapshot.text === "string" && snapshot.text.length > 0
      ? snapshot.text
      : "Text";

  const fontSize = Number(snapshot.fontSize) || 14;
  const width =
    typeof snapshot.width === "number" && snapshot.width > 0
      ? snapshot.width
      : Math.max(120, fontSize * text.length * 0.55);

  const boxOptions: Record<string, unknown> = {
    ...snapshot,
    width,
    splitByGrapheme: true,
    hasControls: true,
    hasBorders: true,
    selectable: true,
    evented: true,
  };

  delete boxOptions.type;
  delete boxOptions.curvature;

  const textbox = new TextboxClass(text, boxOptions);
  textbox.setCoords?.();

  return replaceCanvasTextObject(instance, canvas, active, textbox);
};

/** Toggles curved text path for the selected text element. */
export const toggleCurvedTextPath = (
  instance: PDFEditorInstance | null
): EditorSelectedElement | null => {
  const canvas = getFabricCanvas(instance);
  const active = getActiveObject(instance);

  if (!canvas || !active || !isEditableTextObject(active)) return null;

  if (isArcTextObject(active)) {
    return convertArcTextToPlainText(instance, active, canvas);
  }

  return convertPlainTextToArcText(instance, active, canvas);
};

/** Applies curved text path to the selected plain text. */
export const applyCurvedTextPath = (
  instance: PDFEditorInstance | null
): EditorSelectedElement | null => {
  const canvas = getFabricCanvas(instance);
  const active = getActiveObject(instance);

  if (!canvas || !active) return null;

  if (isArcTextObject(active)) {
    return buildSelectedElement(active);
  }

  if (!isEditableTextObject(active)) return null;

  return convertPlainTextToArcText(instance, active, canvas);
};

export const getSelectedElement = (
  instance: PDFEditorInstance | null
): EditorSelectedElement | null =>
  buildSelectedElement(getActiveObject(instance));

/**
 * Records FE undo snapshots when the user finishes moving/scaling on canvas.
 * Without this, only explicit actions (add shape, property edits) are snapshotted
 * and undo jumps straight to the pre-create state.
 */
export const subscribeToCanvasHistory = (
  instance: PDFEditorInstance | null
): (() => void) => {
  if (!instance) return () => undefined;

  const canvas = getFabricCanvas(instance);
  if (!canvas?.on || !canvas.off) return () => undefined;

  const commitChange = debounceTrailing(() => {
    if (isEditorPropertyPreview(instance)) return;

    const history = getHistoryState(instance);
    if (history?.isRestoring) return;

    persistCanvasToCurrentTemplate(instance);
    recordHistorySnapshot(instance);
    schedulePageThumbnailUpdate(instance);
  }, HISTORY_DEBOUNCE_MS);

  cancelPendingCanvasHistory = () => {
    commitChange.cancel();
  };

  const onCanvasChange = () => {
    commitChange();
  };

  const canvasEvents = [
    "object:modified",
    "object:added",
    "object:removed",
  ] as const;

  canvasEvents.forEach((eventName) => canvas.on?.(eventName, onCanvasChange));

  return () => {
    cancelPendingCanvasHistory = null;
    commitChange.cancel();
    canvasEvents.forEach((eventName) =>
      canvas.off?.(eventName, onCanvasChange)
    );
  };
};

/** Listens for canvas edits and schedules miniature updates for the active page. */
export const subscribeToSelection = (
  instance: PDFEditorInstance | null,
  onChange: (element: EditorSelectedElement | null) => void
): (() => void) => {
  if (!instance) return () => undefined;

  let lastKey = "";

  const emit = () => {
    if (isEditorPropertyPreview(instance)) return;

    const history = getHistoryState(instance);
    if (history?.isRestoring || isEditorHistoryNavigation()) {
      if (lastKey !== "") {
        lastKey = "";
        onChange(null);
      }

      return;
    }

    const element = getSelectedElement(instance);
    const key = element
      ? `${element.id ?? ""}:${element.isArcText}:${element.curvature ?? ""}:${element.rotation}:${element.opacity}:${element.left}:${element.top}`
      : "";

    if (key === lastKey) return;

    lastKey = key;

    if (element) {
      callSdk(instance, "refreshSelectionControls");
    }

    onChange(element);
  };

  const canvas = getFabricCanvas(instance);
  const events = [
    "selection:created",
    "selection:updated",
    "selection:cleared",
    "object:modified",
    "mouse:up",
  ] as const;

  if (canvas?.on && canvas.off) {
    events.forEach((eventName) => canvas.on?.(eventName, emit));
  }

  emit();
  const interval = window.setInterval(emit, SELECTION_POLL_MS);

  return () => {
    if (canvas?.off) {
      events.forEach((eventName) => canvas.off?.(eventName, emit));
    }

    window.clearInterval(interval);
  };
};

export const updateSelectedElement = (
  instance: PDFEditorInstance | null,
  props: Partial<FabricObjectLike>,
  options?: UpdateSelectedElementOptions
): EditorSelectedElement | null => {
  const canvas = getFabricCanvas(instance);
  const active = getActiveObject(instance);
  if (!canvas || !active) return null;

  const persist = options?.persist ?? true;
  const elementType = String(active.type ?? "element");
  const nextProps = { ...props };

  if (
    !supportsElementRotation(elementType) &&
    ("angle" in nextProps || "rotation" in nextProps)
  ) {
    delete nextProps.angle;
    delete (nextProps as { rotation?: number }).rotation;
  }

  active.set?.(nextProps);
  Object.assign(active, nextProps);
  active.setCoords?.();
  canvas.requestRenderAll?.();

  if (!persist) {
    canvas.renderAll?.();

    return null;
  }

  canvas.renderAll?.();
  syncTemplate(instance);

  return buildSelectedElement(active);
};

export const lockSelectedElement = (
  instance: PDFEditorInstance | null,
  locked: boolean
): EditorSelectedElement | null =>
  updateSelectedElement(instance, {
    lockMovementX: locked,
    lockMovementY: locked,
    hasControls: !locked,
    selectable: true,
    evented: true,
    hoverCursor: locked ? "not-allowed" : "default",
    defaultCursor: locked ? "not-allowed" : "default",
  });

const loadImageElement = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = document.createElement("img");
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load QR preview"));
    image.src = src;
  });

const applyImageSource = async (
  object: FabricObjectLike,
  src: string
): Promise<void> => {
  if (object.setSrc) {
    await object.setSrc(src, { crossOrigin: "anonymous" });

    return;
  }

  const element = await loadImageElement(src);
  object.setElement?.(element);
  object.set?.({ width: element.width, height: element.height });
};

const DEFAULT_QR_CODE_SIZE = 160;

const isQRCodeObject = (object: FabricObjectLike): boolean => {
  const normalized = String(object.type ?? "").toLowerCase();

  return (
    normalized === "qrcode" ||
    normalized === "qr-code" ||
    String(object.name ?? "").toLowerCase() === "qrcode"
  );
};

/** Applies a real QR preview image so SDK-created codes are not 0×0. */
export const ensureQRCodeElementInitialized = async (
  instance: PDFEditorInstance | null,
  content: string,
  options?: PDFEditorQRCodeOptions
): Promise<EditorSelectedElement | null> => {
  const active = getActiveObject(instance);
  if (!active || !isQRCodeObject(active)) return null;

  const size = options?.size ?? DEFAULT_QR_CODE_SIZE;
  const codeOption = mapOptionsToCodeOption(options);
  const previewUrl = buildQRCodeDataUrl(
    {
      content,
      codeStyle: codeOption.codeStyle,
      margin: codeOption.codeSpace ? "standard" : "none",
      errorCorrectionLevel: options?.errorCorrectionLevel ?? "M",
    },
    size
  );

  active.set?.({
    codeContent: content,
    codeOption,
    stroke: options?.border ? "#111111" : undefined,
    strokeWidth: options?.border ? 1 : 0,
    shadow: options?.shadow
      ? buildFabricShadow({
          color: "rgba(0,0,0,0.25)",
          blur: 8,
          offsetX: 4,
          offsetY: 4,
        })
      : null,
    angle: options?.angle ?? 0,
  });
  Object.assign(active, { codeContent: content, codeOption });

  try {
    await applyImageSource(active, previewUrl);
  } catch (error) {
    console.warn("[editor] QR initialization failed", error);

    return null;
  }

  const width = active.width ?? 0;
  const height = active.height ?? 0;
  if (width < 16 || height < 16) {
    const base = Math.max(width, height, 1);
    active.scale?.(size / base);
  }

  active.setCoords?.();
  const canvas = getFabricCanvas(instance);
  canvas?.requestRenderAll?.();
  syncTemplate(instance);

  return buildSelectedElement(active);
};

const DEFAULT_BAR_CODE_SIZE = 160;

const isBarCodeObject = (object: FabricObjectLike): boolean => {
  const normalized = String(object.type ?? "").toLowerCase();

  return (
    normalized === "barcode" ||
    normalized === "bar-code" ||
    String(object.name ?? "").toLowerCase() === "barcode"
  );
};

/** Applies a real barcode image so SDK-created codes are not 0×0. */
export const ensureBarCodeElementInitialized = async (
  instance: PDFEditorInstance | null,
  content: string,
  options?: PDFEditorBarCodeOptions
): Promise<EditorSelectedElement | null> => {
  const active = getActiveObject(instance);
  if (!active || !isBarCodeObject(active)) return null;

  const codeOption = mapToJsBarcodeOptions(options);
  const state = parseBarCodeState({
    codeContent: content,
    codeOption,
    strokeWidth: options?.border ? 1 : 0,
    shadow: options?.shadow
      ? buildFabricShadow({
          color: "rgba(0,0,0,0.25)",
          blur: 8,
          offsetX: 4,
          offsetY: 4,
        })
      : null,
  });
  const previewUrl = buildBarCodeDataUrl(state);

  active.set?.({
    codeContent: content,
    codeOption,
    stroke: options?.border ? "#111111" : undefined,
    strokeWidth: options?.border ? 1 : 0,
    shadow: options?.shadow
      ? buildFabricShadow({
          color: "rgba(0,0,0,0.25)",
          blur: 8,
          offsetX: 4,
          offsetY: 4,
        })
      : null,
    angle: options?.angle ?? 0,
  });
  Object.assign(active, { codeContent: content, codeOption });

  try {
    await applyImageSource(active, previewUrl);
  } catch (error) {
    console.warn("[editor] Barcode initialization failed", error);

    return null;
  }

  const width = active.width ?? 0;
  const height = active.height ?? 0;
  if (width < 16 || height < 16) {
    const base = Math.max(width, height, 1);
    active.scale?.(DEFAULT_BAR_CODE_SIZE / base);
  }

  active.setCoords?.();
  const canvas = getFabricCanvas(instance);
  canvas?.requestRenderAll?.();
  syncTemplate(instance);

  return buildSelectedElement(active);
};

/** Updates the selected barcode element and refreshes its preview image. */
export const updateBarCodeElement = async (
  instance: PDFEditorInstance | null,
  patch: Partial<EditorBarCodeState>
): Promise<EditorSelectedElement | null> => {
  const active = getActiveObject(instance);
  if (!active || !isBarCodeObject(active)) return null;

  const current = parseBarCodeState(active);
  const next: EditorBarCodeState = { ...current, ...patch };
  const codeOption = {
    format: next.format,
    width: next.barWidth,
    height: next.height,
    displayValue: next.displayValue,
    background: next.background,
    lineColor: next.lineColor,
    margin: 8,
  };

  const previewUrl = buildBarCodeDataUrl(next);

  active.set?.({
    codeContent: next.content,
    codeOption,
    stroke: next.border ? "#111111" : undefined,
    strokeWidth: next.border ? 1 : 0,
    shadow: next.shadow
      ? buildFabricShadow({
          color: "rgba(0,0,0,0.25)",
          blur: 8,
          offsetX: 4,
          offsetY: 4,
        })
      : null,
  });
  Object.assign(active, {
    codeContent: next.content,
    codeOption,
  });

  try {
    await applyImageSource(active, previewUrl);
  } catch (error) {
    console.warn("[editor] Barcode preview refresh failed", error);
  }

  const canvas = getFabricCanvas(instance);
  active.setCoords?.();
  canvas?.requestRenderAll?.();
  syncTemplate(instance);

  return buildSelectedElement(active);
};

/** Updates the selected QR code element and refreshes its preview image. */
export const updateQRCodeElement = async (
  instance: PDFEditorInstance | null,
  patch: Partial<EditorQRCodeState>
): Promise<EditorSelectedElement | null> => {
  const active = getActiveObject(instance);
  if (!active) return null;

  const current = parseQRCodeState(active);
  const next: EditorQRCodeState = { ...current, ...patch };
  const qrErrorLevelCode: Record<
    EditorQRCodeState["errorCorrectionLevel"],
    number
  > = { L: 0, M: 1, Q: 2, H: 3 };
  const codeOption = {
    codeStyle: next.codeStyle,
    codeSpace: next.margin === "standard",
    codeError: qrErrorLevelCode[next.errorCorrectionLevel],
  };

  const previewUrl = buildQRCodeDataUrl(
    next,
    Math.max(active.width ?? 160, active.getScaledWidth?.() ?? 160)
  );

  active.set?.({
    codeContent: next.content,
    codeOption,
    stroke: next.border ? "#111111" : undefined,
    strokeWidth: next.border ? 1 : 0,
    shadow: next.shadow
      ? buildFabricShadow({
          color: "rgba(0,0,0,0.25)",
          blur: 8,
          offsetX: 4,
          offsetY: 4,
        })
      : null,
  });
  Object.assign(active, {
    codeContent: next.content,
    codeOption,
  });

  try {
    await applyImageSource(active, previewUrl);
  } catch (error) {
    console.warn("[editor] QR preview refresh failed", error);
  }

  const canvas = getFabricCanvas(instance);
  active.setCoords?.();
  canvas?.requestRenderAll?.();
  syncTemplate(instance);

  return buildSelectedElement(active);
};

export const focusElementPropertiesPanel = (): void => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(EDITOR_FOCUS_ELEMENT_PANEL_EVENT));
};

export type EditorAlignCommand =
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "horizontal"
  | "vertical"
  | "center";

export type EditorLayerDirection = "front" | "back" | "up" | "down";

interface WorkspaceBounds {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly centerX: number;
  readonly centerY: number;
}

const getWorkspaceBounds = (
  instance: PDFEditorInstance | null
): WorkspaceBounds | null => {
  const canvas = getFabricCanvas(instance);
  const workspace = canvas
    ?.getObjects?.()
    ?.find((object) => object.id === "WorkSpaceDrawType");

  if (workspace) {
    const width = workspace.width ?? 0;
    const height = workspace.height ?? 0;
    const left = workspace.left ?? 0;
    const top = workspace.top ?? 0;

    return {
      left,
      top,
      width,
      height,
      centerX: left + width / 2,
      centerY: top + height / 2,
    };
  }

  const template = getTemplatesStore(instance)?.currentTemplate;
  if (!template) return null;

  const width = template.width ?? 0;
  const height = template.height ?? 0;

  return {
    left: 0,
    top: 0,
    width,
    height,
    centerX: width / 2,
    centerY: height / 2,
  };
};

type FabricOriginX = "left" | "center" | "right";
type FabricOriginY = "top" | "center" | "bottom";

const resolveOriginX = (active: FabricObjectLike): FabricOriginX => {
  const origin = active.originX;

  return origin === "center" || origin === "right" ? origin : "left";
};

const resolveOriginY = (active: FabricObjectLike): FabricOriginY => {
  const origin = active.originY;

  return origin === "center" || origin === "bottom" ? origin : "top";
};

/** Maps desired object center X to Fabric `left` for the object's originX. */
const leftForCenterX = (
  centerX: number,
  halfWidth: number,
  originX: FabricOriginX
): number => {
  if (originX === "center") return centerX;

  if (originX === "right") return centerX + halfWidth;

  return centerX - halfWidth;
};

/** Maps desired object center Y to Fabric `top` for the object's originY. */
const topForCenterY = (
  centerY: number,
  halfHeight: number,
  originY: FabricOriginY
): number => {
  if (originY === "center") return centerY;

  if (originY === "bottom") return centerY + halfHeight;

  return centerY - halfHeight;
};

/** Aligns the active object within the page workspace (matches pdf-editor SDK). */
export const alignSelectedElement = (
  instance: PDFEditorInstance | null,
  command: EditorAlignCommand
): EditorSelectedElement | null => {
  const active = getActiveObject(instance);
  const bounds = getWorkspaceBounds(instance);
  if (!active || !bounds || isWorkspaceObject(active)) return null;

  const halfWidth = (active.getScaledWidth?.() ?? active.width ?? 0) / 2;
  const halfHeight = (active.getScaledHeight?.() ?? active.height ?? 0) / 2;
  const originX = resolveOriginX(active);
  const originY = resolveOriginY(active);
  const props: Partial<FabricObjectLike> = {};

  switch (command) {
    case "left":
      props.left = leftForCenterX(bounds.left + halfWidth, halfWidth, originX);
      break;
    case "right":
      props.left = leftForCenterX(
        bounds.left + bounds.width - halfWidth,
        halfWidth,
        originX
      );
      break;
    case "top":
      props.top = topForCenterY(bounds.top + halfHeight, halfHeight, originY);
      break;
    case "bottom":
      props.top = topForCenterY(
        bounds.top + bounds.height - halfHeight,
        halfHeight,
        originY
      );
      break;
    case "horizontal":
      props.left = leftForCenterX(bounds.centerX, halfWidth, originX);
      break;
    case "vertical":
      props.top = topForCenterY(bounds.centerY, halfHeight, originY);
      break;
    case "center":
      props.left = leftForCenterX(bounds.centerX, halfWidth, originX);
      props.top = topForCenterY(bounds.centerY, halfHeight, originY);
      break;
    default:
      return null;
  }

  return updateSelectedElement(instance, props);
};

const restoreWorkspaceStackOrder = (canvas: FabricCanvasLike): void => {
  const objects = canvas.getObjects?.() ?? [];
  objects
    .filter((object) => object.id === "WorkSpaceDrawType")
    .forEach((object) => canvas.sendObjectToBack?.(object));
  objects
    .filter((object) => object.id && WORKSPACE_IDS.has(object.id))
    .forEach((object) => {
      if (object.id !== "WorkSpaceDrawType") {
        canvas.bringObjectToFront?.(object);
      }
    });
};

export const moveSelectedLayer = (
  instance: PDFEditorInstance | null,
  direction: EditorLayerDirection
): void => {
  const canvas = getFabricCanvas(instance);
  const active = canvas?.getActiveObject?.();
  if (!canvas || !active || isWorkspaceObject(active)) return;

  if (direction === "front") canvas.bringObjectToFront?.(active);
  else if (direction === "back") canvas.sendObjectToBack?.(active);
  else if (direction === "up") canvas.bringObjectForward?.(active);
  else canvas.sendObjectBackwards?.(active);

  restoreWorkspaceStackOrder(canvas);
  canvas.renderAll?.();
  syncTemplate(instance);
};

export const selectAllElements = (instance: PDFEditorInstance | null): void => {
  callSdk(instance, "selectAll");
};

interface ClientRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

/** Maps a canvas object's bounding box to viewport (client) coordinates. */
export const getCanvasObjectClientRect = (
  instance: PDFEditorInstance | null,
  object: FabricObjectLike
): ClientRect | null => {
  const canvas = getFabricCanvas(instance);
  const element = canvas?.getElement?.();

  if (!canvas || !element) return null;

  object.setCoords?.();

  const bound = (
    object as {
      getBoundingRect?: (absolute?: boolean) => ClientRect;
    }
  ).getBoundingRect?.(true);

  if (!bound) return null;

  const canvasRect = element.getBoundingClientRect();
  const canvasWidth = canvas.width ?? canvasRect.width;
  const canvasHeight = canvas.height ?? canvasRect.height;
  const scaleX = canvasWidth > 0 ? canvasRect.width / canvasWidth : 1;
  const scaleY = canvasHeight > 0 ? canvasRect.height / canvasHeight : 1;

  return {
    left: canvasRect.left + bound.left * scaleX,
    top: canvasRect.top + bound.top * scaleY,
    width: bound.width * scaleX,
    height: bound.height * scaleY,
  };
};

/** Positions a context menu beside the selected object (for locked unlock UI). */
export const getContextMenuAnchorPoint = (
  instance: PDFEditorInstance | null,
  object: FabricObjectLike,
  menuWidth = 220,
  menuHeight = 48
): { readonly x: number; readonly y: number } | null => {
  const rect = getCanvasObjectClientRect(instance, object);
  if (!rect) return null;

  const x = Math.min(
    rect.left + rect.width + 8,
    window.innerWidth - menuWidth - 12
  );
  const y = Math.min(
    Math.max(12, rect.top + rect.height / 2 - menuHeight / 2),
    window.innerHeight - menuHeight - 12
  );

  return { x, y };
};

/** Selects a canvas object and returns its editor element snapshot. */
export const activateCanvasTarget = (
  instance: PDFEditorInstance | null,
  target: FabricObjectLike
): EditorSelectedElement | null => {
  const canvas = getFabricCanvas(instance);
  if (!canvas) return null;

  canvas.setActiveObject?.(target);
  canvas.requestRenderAll?.();

  return buildSelectedElement(target);
};

/** Hit-tests the canvas at viewport coordinates (for context menu targeting). */
export const getCanvasTargetAtClientPoint = (
  instance: PDFEditorInstance | null,
  clientX: number,
  clientY: number
): FabricObjectLike | null => {
  const canvas = getFabricCanvas(instance);
  const element = canvas?.getElement?.();

  if (!canvas?.findTarget || !element) return null;

  const target = canvas.findTarget({
    clientX,
    clientY,
    target: element,
  } as unknown as PointerEvent);

  if (!target || isWorkspaceObject(target)) return null;

  return target;
};

export const copySelectedElement = async (
  instance: PDFEditorInstance | null
): Promise<boolean> => {
  const active = getActiveObject(instance);
  if (!active?.clone || isWorkspaceObject(active)) return false;

  const cloned = await active.clone();
  (instance as unknown as UnknownRecord).__editorClipboard = cloned;

  return true;
};

export const pasteSelectedElement = async (
  instance: PDFEditorInstance | null
): Promise<EditorSelectedElement | null> => {
  const canvas = getFabricCanvas(instance);
  const clipboard = (instance as unknown as UnknownRecord).__editorClipboard as
    | FabricObjectLike
    | undefined;
  if (!canvas || !clipboard?.clone) return null;

  const cloned = await clipboard.clone();
  const nextLeft = (clipboard.left ?? 0) + 12;
  const nextTop = (clipboard.top ?? 0) + 12;
  cloned.set?.({
    left: nextLeft,
    top: nextTop,
    evented: true,
    selectable: true,
  });
  Object.assign(cloned, {
    left: nextLeft,
    top: nextTop,
    evented: true,
    selectable: true,
  });
  canvas.discardActiveObject?.();
  canvas.add?.(cloned);
  canvas.setActiveObject?.(cloned);
  clipboard.left = nextLeft;
  clipboard.top = nextTop;
  canvas.renderAll?.();
  syncTemplate(instance);

  return buildSelectedElement(cloned);
};

export const cutSelectedElement = async (
  instance: PDFEditorInstance | null
): Promise<boolean> => {
  const copied = await copySelectedElement(instance);
  if (!copied) return false;

  callSdk(instance, "deleteSelected");
  setTimeout(() => recordHistorySnapshot(instance), 0);

  return true;
};

export const runHistory = async (
  instance: PDFEditorInstance | null,
  direction: "undo" | "redo"
): Promise<EditorHistoryRunResult | null> => {
  activatePinia(instance);
  beginHistoryNavigation();

  try {
    // Do not sync/record canvas state here — that pushed a duplicate snapshot and
    // made undo skip past the pre-delete page restore.
    cancelPendingCanvasHistory?.();
    const history = getHistoryState(instance);

    if (history) {
      const nextCursor =
        direction === "undo" ? history.cursor - 1 : history.cursor + 1;
      const snapshot = history.snapshots[nextCursor];

      if (snapshot) {
        const previousPageCount = getTemplatePageCount(instance);
        const pageCountChanges =
          snapshot.templates.length !== previousPageCount;

        history.cursor = nextCursor;

        const restoreWork = async () => {
          await restoreHistorySnapshot(instance, snapshot);
          await waitForCanvasReady(getFabricCanvas(instance));
          reapplyPageRotation(instance);
        };

        if (pageCountChanges) {
          await runWithCanvasHidden(instance, restoreWork);
        } else {
          await restoreWork();
        }

        return finishHistorySync(instance, previousPageCount);
      }
    }

    const snapshotStore = getSnapshotStore(instance);
    const method =
      direction === "undo" ? snapshotStore?.unDo : snapshotStore?.reDo;
    if (!method) return null;

    const previousPageCount = getTemplatePageCount(instance);

    await runWithCanvasHidden(instance, async () => {
      await method.call(snapshotStore);
      await waitForCanvasReady(getFabricCanvas(instance));
      reapplyPageRotation(instance);
    });

    return finishHistorySync(instance, previousPageCount);
  } finally {
    endHistoryNavigation();
  }
};

export const goToPageRendered = async (
  instance: PDFEditorInstance | null,
  pageNumber: number
): Promise<boolean> => {
  activatePinia(instance);

  // Continuous mode: the SDK scrolls the page into view and activates its canvas.
  // No full-canvas clear/reload, and edits are auto-persisted per page.
  if (isContinuousLayout(instance)) {
    callSdk(instance, "goToPage", pageNumber);

    return true;
  }

  const store = getTemplatesStore(instance);
  if (!store?.setTemplateIndex) {
    callSdk(instance, "goToPage", pageNumber);

    return false;
  }

  try {
    const count = store.templates?.length ?? 1;
    const nextIndex = Math.min(Math.max(0, pageNumber - 1), count - 1);
    const previousPage = getCurrentPageFromStore(instance);

    if (previousPage !== nextIndex + 1) {
      persistCanvasToCurrentTemplate(instance);
      schedulePageThumbnailUpdate(instance, previousPage);
    }

    store.setTemplateIndex(nextIndex);
    await store.renderTemplate?.();
    callSdk(instance, "lockWorkspaceObjects");
    applyEditorViewportTheme(instance);
    setTimeout(() => reapplyPageRotation(instance), 0);

    return true;
  } catch (err) {
    console.error("[sdk] goToPageRendered failed", err);

    return false;
  }
};

export const getCurrentPageFromStore = (
  instance: PDFEditorInstance | null
): number => {
  const idx = getTemplatesStore(instance)?.templateIndex ?? 0;

  return idx + 1;
};

export const getTemplatePageCount = (
  instance: PDFEditorInstance | null
): number => getTemplatesStore(instance)?.templates?.length ?? 0;

const cloneTemplate = (template: TemplateLike): TemplateLike =>
  JSON.parse(JSON.stringify(template)) as TemplateLike;

const createBlankTemplate = (
  instance: PDFEditorInstance | null
): TemplateLike | null => {
  const store = getTemplatesStore(instance);
  const current =
    store?.currentTemplate ?? store?.templates?.[store.templateIndex ?? 0];
  if (!current) return null;

  const blank = cloneTemplate(current);
  blank.id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  blank.objects = (blank.objects ?? []).filter((object) =>
    isWorkspaceObject(object)
  );
  if (blank.objects.length === 0) {
    blank.objects = [
      {
        id: "WorkSpaceDrawType",
        name: "rect",
        type: "Rect",
        left: 0,
        top: 0,
        width: blank.width,
        height: blank.height,
        fill: "#fff",
        selectable: false,
        evented: false,
      },
    ];
  }

  blank.background = current.background ?? "#ffffff";

  return blank;
};

export const addPageRendered = async (
  instance: PDFEditorInstance | null,
  position: "above" | "below" | "end" = "below",
  atPage?: number
): Promise<number | null> => {
  activatePinia(instance);
  const store = getTemplatesStore(instance);
  if (!store?.addTemplate) {
    callSdk(instance, "addPage");

    return null;
  }

  try {
    if (atPage !== undefined) {
      const pageIndex = Math.min(
        Math.max(0, atPage - 1),
        Math.max(0, (store.templates?.length ?? 1) - 1)
      );
      store.setTemplateIndex?.(pageIndex);
      if (!store.setTemplateIndex) store.templateIndex = pageIndex;
    }

    const blank = createBlankTemplate(instance) ?? undefined;
    const currentIndex = store.templateIndex ?? 0;
    let index = store.templates?.length;

    if (position === "above") {
      index = currentIndex;
    } else if (position === "below") {
      index = currentIndex + 1;
    }

    recordHistorySnapshot(instance);
    await store.addTemplate(blank, index);
    const nextPage = (store.templateIndex ?? index ?? 0) + 1;
    await store.renderTemplate?.();
    recordHistorySnapshot(instance);

    return nextPage;
  } catch (err) {
    console.error("[sdk] addPageRendered failed", err);

    return null;
  }
};

export const deletePageRendered = async (
  instance: PDFEditorInstance | null,
  pageNumber: number
): Promise<number | null> => {
  activatePinia(instance);
  const store = getTemplatesStore(instance);
  const templates = store?.templates;
  if (!store?.deleteTemplate || !templates || templates.length <= 1)
    return null;

  try {
    const index = Math.min(Math.max(0, pageNumber - 1), templates.length - 1);
    if (!templates[index]) return null;

    recordHistorySnapshot(instance);

    const remaining = cloneTemplates(templates).filter((_, i) => i !== index);
    let newIndex = index;
    const maxIndex = remaining.length - 1;
    if (newIndex > maxIndex) newIndex = maxIndex;

    if (store.setTemplates) {
      store.setTemplates(remaining);
    } else {
      store.templates = remaining;
    }

    store.setTemplateIndex?.(newIndex);
    if (!store.setTemplateIndex) {
      store.templateIndex = newIndex;
    }

    await store.renderTemplate?.();
    recordHistorySnapshot(instance);

    return (store.templateIndex ?? 0) + 1;
  } catch (err) {
    console.error("[sdk] deletePageRendered failed", err);

    return null;
  }
};

const getActiveCanvasWrapper = (
  instance: PDFEditorInstance | null
): HTMLElement | null => {
  const canvas = getFabricCanvas(instance);
  if (!canvas) return null;

  if (canvas.wrapperEl) return canvas.wrapperEl;

  const element = canvas.getElement?.();

  return element?.parentElement ?? null;
};

const withCanvasCaptureHidden = async (
  instance: PDFEditorInstance | null,
  work: () => Promise<void>
): Promise<void> => {
  const wrapper = getActiveCanvasWrapper(instance);

  if (wrapper) wrapper.style.visibility = "hidden";

  try {
    await work();
  } finally {
    // Always restore to visible. Nesting another capture inside would have
    // re-captured the hidden state and left the canvas dark on rare flows
    // (the previous `previousVisibility ??` logic was reentrancy-prone).
    if (wrapper) {
      wrapper.style.visibility = "";
    }
  }
};

/**
 * Captures the currently rendered Fabric canvas (lower-canvas bitmap) and
 * downsamples it to thumbnail size. Bypasses Fabric's `toDataURL`, which
 * collapses rotated viewports to an identity matrix and would otherwise
 * yield thumbnails that ignore page rotation.
 *
 * Crops to the page (workspace) bounding box on screen so the thumbnail tracks
 * the page's aspect ratio instead of capturing the full canvas viewport (which
 * includes the dark matte around the page).
 */
const PAGE_THUMBNAIL_TARGET_WIDTH = 320;
const PAGE_THUMBNAIL_MIN_MULTIPLIER = 0.18;
const PAGE_THUMBNAIL_MAX_MULTIPLIER = 1;

interface PageCanvasCropRect {
  readonly sx: number;
  readonly sy: number;
  readonly sw: number;
  readonly sh: number;
}

/**
 * Returns the page (`WorkSpaceDrawType`) bounding box in lower-canvas bitmap
 * pixels, accounting for current viewport transform (zoom + rotation) and
 * device-pixel-ratio scaling of the underlying canvas element.
 */
const getPageRectOnLowerCanvas = (
  canvas: FabricCanvasLike,
  lower: HTMLCanvasElement
): PageCanvasCropRect | null => {
  const workspace = canvas
    .getObjects?.()
    ?.find((object) => object.id === "WorkSpaceDrawType");
  if (!workspace) return null;

  workspace.setCoords?.();

  const corners = (
    workspace as FabricObjectLike & {
      oCoords?: Partial<
        Record<"tl" | "tr" | "bl" | "br", { x: number; y: number }>
      >;
    }
  ).oCoords;

  const tl = corners?.tl;
  const tr = corners?.tr;
  const bl = corners?.bl;
  const br = corners?.br;
  if (!tl || !tr || !bl || !br) return null;

  const left = Math.min(tl.x, tr.x, bl.x, br.x);
  const right = Math.max(tl.x, tr.x, bl.x, br.x);
  const top = Math.min(tl.y, tr.y, bl.y, br.y);
  const bottom = Math.max(tl.y, tr.y, bl.y, br.y);

  const internalWidth = canvas.width ?? lower.width;
  const internalHeight = canvas.height ?? lower.height;
  const pixelScaleX = internalWidth > 0 ? lower.width / internalWidth : 1;
  const pixelScaleY = internalHeight > 0 ? lower.height / internalHeight : 1;

  const cropLeft = Math.max(0, Math.floor(left * pixelScaleX));
  const cropTop = Math.max(0, Math.floor(top * pixelScaleY));
  const cropRight = Math.min(lower.width, Math.ceil(right * pixelScaleX));
  const cropBottom = Math.min(lower.height, Math.ceil(bottom * pixelScaleY));

  const sw = cropRight - cropLeft;
  const sh = cropBottom - cropTop;
  if (sw <= 0 || sh <= 0) return null;

  return { sx: cropLeft, sy: cropTop, sw, sh };
};

const captureLowerCanvasAsThumbnail = (
  canvas: FabricCanvasLike,
  quality: number = 0.76
): string | null => {
  const lower = (
    canvas as FabricCanvasLike & { lowerCanvasEl?: HTMLCanvasElement }
  ).lowerCanvasEl;
  if (!lower || lower.width <= 0 || lower.height <= 0) return null;

  const crop = getPageRectOnLowerCanvas(canvas, lower) ?? {
    sx: 0,
    sy: 0,
    sw: lower.width,
    sh: lower.height,
  };

  const naturalMultiplier = PAGE_THUMBNAIL_TARGET_WIDTH / crop.sw;
  const multiplier = Math.min(
    PAGE_THUMBNAIL_MAX_MULTIPLIER,
    Math.max(PAGE_THUMBNAIL_MIN_MULTIPLIER, naturalMultiplier)
  );

  const thumb = document.createElement("canvas");
  thumb.width = Math.max(1, Math.floor(crop.sw * multiplier));
  thumb.height = Math.max(1, Math.floor(crop.sh * multiplier));
  const ctx = thumb.getContext("2d");
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    lower,
    crop.sx,
    crop.sy,
    crop.sw,
    crop.sh,
    0,
    0,
    thumb.width,
    thumb.height
  );

  return thumb.toDataURL("image/png", quality);
};

const THUMBNAIL_EXPORT_DPI = 64;

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read thumbnail blob"));
    reader.readAsDataURL(blob);
  });

/**
 * Captures a page miniature. Unrotated pages read the on-screen lower-canvas
 * bitmap directly (fast). Rotated pages can't be reliably read from the rotated
 * viewport, so the page is rasterized in native orientation via the export path
 * and the bitmap is rotated to match — the same approach as ZIP/PDF export.
 */
const captureThumbnailDataUrl = async (
  instance: PDFEditorInstance | null,
  canvas: FabricCanvasLike,
  pageNumber: number
): Promise<string | null> => {
  const rotation = instance
    ? normalizeRotation(getRotations(instance)[pageNumber - 1] ?? 0)
    : 0;

  if (rotation === 0) {
    return captureLowerCanvasAsThumbnail(canvas);
  }

  const restoreViewport = withIdentityViewport(canvas);
  canvas.renderAll?.();

  let nativeBlob: Blob | null = null;
  try {
    nativeBlob = exportCurrentPageImage(instance, "jpeg", 0.82, {
      dpi: THUMBNAIL_EXPORT_DPI,
      ignoreBlankEdges: false,
    });
  } catch {
    nativeBlob = null;
  } finally {
    restoreViewport();
    canvas.renderAll?.();
  }

  if (!nativeBlob) {
    return captureLowerCanvasAsThumbnail(canvas);
  }

  const rotatedBlob = await rotateImageBlob(nativeBlob, rotation, "jpeg", 0.82);

  return blobToDataUrl(rotatedBlob);
};

export const captureCurrentPageThumbnail = async (
  instance: PDFEditorInstance | null,
  pageNumber: number
): Promise<EditorPageThumbnail | null> => {
  const canvas = getFabricCanvas(instance);
  if (!canvas) return null;

  await waitForCanvasReady(canvas);
  canvas.renderAll?.();

  const dataUrl = await captureThumbnailDataUrl(instance, canvas, pageNumber);
  if (!dataUrl) return null;

  return { page: pageNumber, dataUrl };
};

export const renderPageThumbnailAt = async (
  instance: PDFEditorInstance | null,
  pageNumber: number
): Promise<EditorPageThumbnail | null> => {
  if (isEditorHistoryNavigation()) return null;

  activatePinia(instance);
  const store = getTemplatesStore(instance);
  const canvas = getFabricCanvas(instance);
  const templates = store?.templates;

  if (!store || !canvas || !templates?.length) return null;

  const index = pageNumber - 1;
  if (index < 0 || index >= templates.length) return null;

  // Continuous mode: every page owns a live canvas. Capture that page's own
  // canvas directly instead of re-rendering the target template onto the shared
  // active canvas — the shared-canvas path (setTemplateIndex + renderTemplate)
  // repaints and un-fits the page the user is currently viewing (page 1 would
  // go blank as later pages streamed in and triggered captures).
  if (isContinuousLayout(instance)) {
    const pageCanvas = callSdk<FabricCanvasLike | null>(
      instance,
      "getPageCanvas",
      pageNumber
    );
    if (!pageCanvas) return null; // not initialized yet — keep the pdfjs preview

    await waitForCanvasReady(pageCanvas);
    pageCanvas.renderAll?.();
    const dataUrl = await captureThumbnailDataUrl(
      instance,
      pageCanvas,
      pageNumber
    );
    if (!dataUrl) return null;

    return { page: pageNumber, dataUrl };
  }

  const originalIndex = store.templateIndex ?? 0;
  const captureRenderedPage = async (): Promise<EditorPageThumbnail> => {
    await store.renderTemplate?.();
    await waitForCanvasReady(canvas);
    // Apply the active page's rotation viewport so the captured thumbnail
    // matches the rotation users see in the sidebar.
    fitEditorToScreen(instance);
    canvas.renderAll?.();

    const dataUrl = await captureThumbnailDataUrl(instance, canvas, pageNumber);
    if (!dataUrl) {
      throw new Error("Canvas thumbnail export is not available");
    }

    return { page: pageNumber, dataUrl };
  };

  if (originalIndex === index) {
    return captureRenderedPage();
  }

  let thumbnail: EditorPageThumbnail | null = null;

  await withCanvasCaptureHidden(instance, async () => {
    store.setTemplateIndex?.(index);
    if (!store.setTemplateIndex) store.templateIndex = index;

    thumbnail = await captureRenderedPage();

    store.setTemplateIndex?.(originalIndex);
    if (!store.setTemplateIndex) store.templateIndex = originalIndex;

    await store.renderTemplate?.();
    setTimeout(() => reapplyPageRotation(instance), 0);
  });

  return thumbnail;
};

export const renderPageThumbnails = async (
  instance: PDFEditorInstance | null
): Promise<EditorPageThumbnail[]> => {
  if (isEditorHistoryNavigation()) return [];

  activatePinia(instance);
  const store = getTemplatesStore(instance);
  const canvas = getFabricCanvas(instance);
  const templates = store?.templates;

  if (!store || !canvas || !templates?.length) return [];

  // Continuous mode: read each page from its own live canvas. Never drive the
  // shared canvas via setTemplateIndex/renderTemplate (that blanks the page the
  // user is viewing). Pages not yet initialized keep their pdfjs placeholder.
  if (isContinuousLayout(instance)) {
    const results: EditorPageThumbnail[] = [];
    for (let index = 0; index < templates.length; index += 1) {
      const pageNumber = index + 1;
      if (isLoadingPlaceholderTemplate(templates[index])) {
        results.push({ page: pageNumber, dataUrl: PAGE_THUMBNAIL_PLACEHOLDER });
        continue;
      }

      const pageCanvas = callSdk<FabricCanvasLike | null>(
        instance,
        "getPageCanvas",
        pageNumber
      );
      if (!pageCanvas) {
        results.push({ page: pageNumber, dataUrl: PAGE_THUMBNAIL_PLACEHOLDER });
        continue;
      }

      await waitForCanvasReady(pageCanvas);
      pageCanvas.renderAll?.();
      const dataUrl = await captureThumbnailDataUrl(
        instance,
        pageCanvas,
        pageNumber
      );
      results.push({
        page: pageNumber,
        dataUrl: dataUrl ?? PAGE_THUMBNAIL_PLACEHOLDER,
      });
    }

    return results;
  }

  const originalIndex = store.templateIndex ?? 0;
  const thumbnails: EditorPageThumbnail[] = [];

  await withCanvasCaptureHidden(instance, async () => {
    try {
      for (let index = 0; index < templates.length; index += 1) {
        // Skip pages still streaming in the background: rendering them would
        // capture a blank frame and needlessly flip the (hidden) canvas. They
        // keep the placeholder image until PDF_EDITOR_PAGE_LOADED refreshes them.
        if (isLoadingPlaceholderTemplate(templates[index])) {
          thumbnails.push({
            page: index + 1,
            dataUrl: PAGE_THUMBNAIL_PLACEHOLDER,
          });
          continue;
        }

        store.setTemplateIndex?.(index);
        if (!store.setTemplateIndex) store.templateIndex = index;

        await store.renderTemplate?.();
        await waitForCanvasReady(canvas);
        fitEditorToScreen(instance);
        canvas.renderAll?.();

        const dataUrl = captureLowerCanvasAsThumbnail(canvas);
        if (!dataUrl) continue;

        thumbnails.push({ page: index + 1, dataUrl });
      }
    } finally {
      store.setTemplateIndex?.(originalIndex);
      if (!store.setTemplateIndex) store.templateIndex = originalIndex;

      await store.renderTemplate?.();
      setTimeout(() => reapplyPageRotation(instance), 0);
    }
  });

  return thumbnails;
};

const getRotations = (instance: PDFEditorInstance): RotationMap => {
  const bag = instance as unknown as UnknownRecord;
  if (!bag[ROT_KEY]) bag[ROT_KEY] = {};

  return bag[ROT_KEY] as RotationMap;
};

/**
 * Resolves the DOM element the prior CSS-rotation approach used as a transform
 * target. Kept solely to clear any leftover transforms from earlier sessions.
 */
const getCanvasRotationTarget = (
  canvas: FabricCanvasLike
): HTMLElement | null => {
  const lowerCanvas = (
    canvas as FabricCanvasLike & { lowerCanvasEl?: HTMLElement }
  ).lowerCanvasEl;

  return lowerCanvas?.parentElement ?? canvas.wrapperEl ?? null;
};

const clearCanvasViewportRotation = (
  instance: PDFEditorInstance | null
): void => {
  const canvas = getFabricCanvas(instance);
  if (!canvas) return;

  const target = getCanvasRotationTarget(canvas);
  if (target) {
    target.style.transform = "";
    target.style.transformOrigin = "";
    target.style.transition = "";
  }

  const wrapper = getActiveCanvasWrapper(instance);
  if (wrapper && wrapper !== target) {
    wrapper.style.transform = "";
    wrapper.style.transformOrigin = "";
    wrapper.style.transition = "";
  }
};

interface WorkspacePageSize {
  readonly width: number;
  readonly height: number;
}

const getWorkspacePageSize = (
  canvas: FabricCanvasLike
): WorkspacePageSize | null => {
  const workspace = canvas
    .getObjects?.()
    ?.find((object) => object.id === "WorkSpaceDrawType");

  if (!workspace) return null;

  const width = workspace.getScaledWidth?.() ?? workspace.width ?? 0;
  const height = workspace.getScaledHeight?.() ?? workspace.height ?? 0;

  if (width <= 0 || height <= 0) return null;

  return { width, height };
};

const FIT_VIEWPORT_PADDING = 0.9;

const normalizeRotation = (value: number): 0 | 90 | 180 | 270 => {
  const normalized = ((Math.round(value) % 360) + 360) % 360;
  if (normalized === 90 || normalized === 180 || normalized === 270) {
    return normalized;
  }

  return 0;
};

/**
 * Computes the effective scale magnitude from a Fabric viewport transform.
 * Works for any rotation (0/90/180/270) because Fabric's stock `getZoom()`
 * only reads `vt[0]`, which collapses to 0 for orthogonal rotations.
 */
const zoomFromViewportTransform = (vt: number[] | undefined): number => {
  if (!Array.isArray(vt) || vt.length < 4) return 1;

  const a = vt[0] ?? 0;
  const b = vt[1] ?? 0;
  const c = vt[2] ?? 0;
  const fromCol0 = Math.hypot(a, b);
  if (fromCol0 > 0) return fromCol0;

  return Math.abs(c);
};

/**
 * Returns the effective zoom factor regardless of viewport rotation.
 * Fabric's `getZoom()` only returns `vt[0]`, which is 0 for 90/270° rotations.
 */
export const getEditorZoom = (instance: PDFEditorInstance | null): number => {
  // Continuous mode zoom is a column-scale factor owned by the SDK, not the
  // per-page fit zoom baked into each canvas viewport transform.
  if (isContinuousLayout(instance)) {
    return callSdk<number>(instance, "getZoom") ?? 1;
  }

  const canvas = getFabricCanvas(instance);
  const vt = canvas?.viewportTransform;
  if (!Array.isArray(vt) || vt.length < 4) {
    return callSdk<number>(instance, "getZoom") ?? 1;
  }

  return zoomFromViewportTransform(vt);
};

/**
 * Patches Fabric's `canvas.getZoom()` so it returns the actual scale magnitude
 * regardless of rotation. Without this, rect-style objects with `objectCaching`
 * (workspace background, mask, clip rects) render a 0×0 cache and disappear
 * when the viewport is rotated 90°/270°.
 *
 * Safe to call multiple times — the patch is idempotent.
 */
const patchCanvasGetZoomForRotation = (canvas: FabricCanvasLike): void => {
  type GetZoomCanvas = FabricCanvasLike & {
    getZoom?: () => number;
    __rotationAwareGetZoom?: true;
  };
  const target = canvas as GetZoomCanvas;
  if (target.__rotationAwareGetZoom) return;

  const original = target.getZoom?.bind(target);
  target.getZoom = function rotationAwareGetZoom(): number {
    const vt = (this as GetZoomCanvas).viewportTransform;
    const computed = zoomFromViewportTransform(vt);
    if (computed > 0) return computed;

    if (original) return original();

    return 1;
  };
  target.__rotationAwareGetZoom = true;
};

const getCurrentPageRotation = (
  instance: PDFEditorInstance | null
): 0 | 90 | 180 | 270 => {
  if (!instance) return 0;

  const store = getTemplatesStore(instance);
  const pageIndex = store?.templateIndex ?? 0;
  const rotations = getRotations(instance);

  return normalizeRotation(rotations[pageIndex] ?? 0);
};

interface ViewportFitParams {
  readonly rotation: 0 | 90 | 180 | 270;
  readonly zoom: number;
  readonly workspaceWidth: number;
  readonly workspaceHeight: number;
  readonly containerWidth: number;
  readonly containerHeight: number;
}

/**
 * Builds the Fabric viewport transform matrix [a, b, c, d, e, f] that displays
 * the workspace rotated `rotation` degrees CLOCKWISE on screen (Y-down).
 *
 * Mappings (workspace `(x, y)` → screen, before zoom/centering):
 *  -  90° CW:  (x, y) → (H - y,  x)
 *  - 180°:    (x, y) → (W - x, H - y)
 *  - 270° CW: (x, y) → (y, W - x)
 *
 * Rotating via the camera (viewport transform) rather than per-object means:
 *   - Pointer events keep working — Fabric inverts the matrix automatically
 *   - No template/object mutation, so PDF/SVG round-tripping is unaffected
 *   - Long pages don't clip because zoom is computed against rotated dims
 */
const buildRotatedViewportTransform = (params: ViewportFitParams): number[] => {
  const {
    rotation,
    zoom,
    workspaceWidth: W,
    workspaceHeight: H,
    containerWidth: cw,
    containerHeight: ch,
  } = params;
  const Z = zoom;

  switch (rotation) {
    case 90:
      return [0, Z, -Z, 0, (cw + Z * H) / 2, (ch - Z * W) / 2];
    case 180:
      return [-Z, 0, 0, -Z, (cw + Z * W) / 2, (ch + Z * H) / 2];
    case 270:
      return [0, -Z, Z, 0, (cw - Z * H) / 2, (ch + Z * W) / 2];
    default:
      return [Z, 0, 0, Z, (cw - Z * W) / 2, (ch - Z * H) / 2];
  }
};

const applyViewportTransform = (
  canvas: FabricCanvasLike,
  transform: number[]
): void => {
  const canvasWithViewport = canvas as FabricCanvasLike & {
    setViewportTransform?: (transform: number[]) => void;
    viewportTransform?: number[];
  };

  if (canvasWithViewport.setViewportTransform) {
    canvasWithViewport.setViewportTransform(transform);

    return;
  }

  if (Array.isArray(canvasWithViewport.viewportTransform)) {
    transform.forEach((value, index) => {
      canvasWithViewport.viewportTransform![index] = value;
    });
    canvas.requestRenderAll?.();
  }
};

/**
 * Fits the workspace into the visible canvas area, honoring the current page's
 * rotation (0/90/180/270). Zoom is computed against the rotated workspace
 * dimensions so long pages remain fully visible after rotation.
 */
export const fitEditorToScreen = (instance: PDFEditorInstance | null): void => {
  if (!instance) return;

  // Continuous mode: "fit" resets the page column to fit-to-width (SDK-owned).
  if (isContinuousLayout(instance)) {
    callSdk(instance, "fitToScreen");

    return;
  }

  fitActiveCanvasViewport(instance);
};

/**
 * Fits (and optionally rotates) the currently-active page canvas via its Fabric
 * viewport transform. Used by single-mode fit and by page rotation in both modes
 * (rotation is a per-page viewport transform on the focused canvas).
 */
const fitActiveCanvasViewport = (instance: PDFEditorInstance | null): void => {
  if (!instance) return;

  clearCanvasViewportRotation(instance);

  const canvas = getFabricCanvas(instance);
  const wrapper = getActiveCanvasWrapper(instance);
  if (wrapper) wrapper.style.overflow = "hidden";

  if (!canvas || !wrapper) {
    callSdk(instance, "fitToScreen");

    return;
  }

  patchCanvasGetZoomForRotation(canvas);

  const pageSize = getWorkspacePageSize(canvas);
  const containerWidth = wrapper.clientWidth;
  const containerHeight = wrapper.clientHeight;

  if (!pageSize || containerWidth <= 0 || containerHeight <= 0) {
    callSdk(instance, "fitToScreen");

    return;
  }

  const rotation = getCurrentPageRotation(instance);
  const isQuarterTurn = rotation === 90 || rotation === 270;
  const fitWidth = isQuarterTurn ? pageSize.height : pageSize.width;
  const fitHeight = isQuarterTurn ? pageSize.width : pageSize.height;

  const zoom =
    Math.min(containerWidth / fitWidth, containerHeight / fitHeight) *
    FIT_VIEWPORT_PADDING;

  applyViewportTransform(
    canvas,
    buildRotatedViewportTransform({
      rotation,
      zoom,
      workspaceWidth: pageSize.width,
      workspaceHeight: pageSize.height,
      containerWidth,
      containerHeight,
    })
  );

  const workspaceObjects = canvas.getObjects?.() ?? [];
  workspaceObjects.forEach((object) => {
    if (object && object.dirty === false) object.dirty = true;
  });
  canvas.requestRenderAll?.();
};

const repaintWorkspaceMask = (object: FabricObjectLike): void => {
  if (object.id !== "WorkSpaceMaskType") return;

  const needsRepaint = object.fill !== EDITOR_VIEWPORT_BG;
  const needsCacheReset = object.objectCaching !== false;
  if (!needsRepaint && !needsCacheReset) return;

  const patch = {
    fill: EDITOR_VIEWPORT_BG,
    objectCaching: false,
    dirty: true,
  };

  object.set?.(patch);
  Object.assign(object, patch);
};

/**
 * The SDK re-creates `WorkSpaceMaskType` on every internal render (page change,
 * template re-render, etc.) with its default light-gray `#f3f3f3` fill, which
 * undoes any one-shot fix applied via {@link applyEditorViewportTheme}. This
 * installs a single persistent `object:added` listener that repaints the mask
 * to the dark viewport color every time the SDK re-adds it, and also disables
 * its `objectCaching` so the 50000×50000 path doesn't rasterize through a
 * clamped cache bitmap (which produces a blurry ~25 px gradient at the page
 * edges instead of a clean, single-tone matte).
 */
const patchCanvasMaskTheme = (canvas: FabricCanvasLike): void => {
  type MaskThemedCanvas = FabricCanvasLike & { __maskThemePatched?: true };
  const target = canvas as MaskThemedCanvas;
  if (target.__maskThemePatched) return;

  canvas.on?.("object:added", (event: unknown) => {
    const payload = event as { target?: FabricObjectLike };
    const added = payload.target;
    if (!added?.id) return;

    repaintWorkspaceMask(added);
  });

  target.__maskThemePatched = true;
};

const applyEditorViewportThemeToCanvas = (canvas: FabricCanvasLike): void => {
  canvas.backgroundColor = EDITOR_VIEWPORT_BG;

  const wrapper = canvas.wrapperEl;
  if (wrapper) {
    wrapper.style.backgroundColor = EDITOR_VIEWPORT_BG;
  }

  const lowerCanvas = (
    canvas as FabricCanvasLike & { lowerCanvasEl?: HTMLElement }
  ).lowerCanvasEl;
  if (lowerCanvas?.parentElement) {
    lowerCanvas.parentElement.style.backgroundColor = EDITOR_VIEWPORT_BG;
  }

  patchCanvasMaskTheme(canvas);

  canvas.getObjects?.().forEach(repaintWorkspaceMask);
};

/** Paints the dark viewport behind the page and fixes mask matte color. */
export const applyEditorViewportTheme = (
  instance: PDFEditorInstance | null
): void => {
  // Continuous mode paints its own light "desk" behind white pages; the SDK
  // controller fits each page canvas, so no per-canvas viewport theming here.
  if (isContinuousLayout(instance)) return;

  const canvas = getFabricCanvas(instance);
  if (!canvas) return;

  clearCanvasViewportRotation(instance);
  patchCanvasGetZoomForRotation(canvas);
  applyEditorViewportThemeToCanvas(canvas);
  canvas.requestRenderAll?.();
};

/**
 * Rotates the current page by `delta` degrees (use -90 for counter-clockwise).
 * Rotation is stored per-page in the rotation map (PDF CW degrees) and applied
 * via the Fabric viewport transform. Export stamps matching `/Rotate` metadata.
 */
export const rotateCurrentPage = (
  instance: PDFEditorInstance | null,
  delta: number
): number | null => {
  if (!instance || !delta) return null;

  const store = getTemplatesStore(instance);
  const templates = store?.templates;
  const pageIndex = store?.templateIndex ?? 0;
  if (!templates?.[pageIndex]) return null;

  const canvas = getFabricCanvas(instance);
  canvas?.discardActiveObject?.();

  const rotations = getRotations(instance);
  const current = normalizeRotation(rotations[pageIndex] ?? 0);
  const next = normalizeRotation(current + delta);
  if (next === current) return null;

  rotations[pageIndex] = next;

  // Rotate the focused page's canvas viewport directly. In continuous mode this
  // applies to the active page (persists while it stays focused).
  fitActiveCanvasViewport(instance);
  recordHistorySnapshot(instance);
  schedulePageThumbnailUpdate(instance);

  return next;
};

/**
 * Re-applies the rotation viewport transform for whichever page is now active
 * (e.g. after navigation, history restoration or thumbnail capture). Idempotent.
 */
export const reapplyPageRotation = (
  instance: PDFEditorInstance | null
): void => {
  if (!instance) return;

  fitEditorToScreen(instance);
};

export const getPageSettings = (
  instance: PDFEditorInstance | null
): EditorPageSettings | null => {
  const template = getTemplatesStore(instance)?.currentTemplate;
  if (!template) return null;

  const workspace = template.objects?.find(
    (object) => object.id === "WorkSpaceDrawType"
  );

  const zoom = template.zoom ?? 1;
  const workspaceWidth = Math.round((workspace?.width ?? 0) * zoom);
  const workspaceHeight = Math.round((workspace?.height ?? 0) * zoom);

  return {
    unit: "px",
    width: Math.round(template.width ?? workspaceWidth ?? 0),
    height: Math.round(template.height ?? workspaceHeight ?? 0),
    background: normalizePageColor(
      (typeof workspace?.fill === "string" && workspace.fill) || "#ffffff"
    ),
  };
};

export const applyPageSettings = async (
  instance: PDFEditorInstance | null,
  settings: EditorPageSettings,
  applyToAll: boolean
): Promise<void> => {
  activatePinia(instance);
  const store = getTemplatesStore(instance);
  const templates = store?.templates;
  if (!store || !templates) return;

  const normalizedSettings: EditorPageSettings = {
    ...settings,
    background: normalizePageColor(settings.background),
  };

  const currentIndex = store.templateIndex ?? 0;
  const indexes = applyToAll
    ? templates.map((_, index) => index)
    : [currentIndex];

  const dimensionsChanged = indexes.some((index) => {
    const template = templates[index];
    if (!template) return false;

    return (
      Math.round(template.width ?? 0) !== normalizedSettings.width ||
      Math.round(template.height ?? 0) !== normalizedSettings.height
    );
  });

  indexes.forEach((index) => {
    const template = templates[index];
    if (!template) return;

    template.width = normalizedSettings.width;
    template.height = normalizedSettings.height;
    applyBackgroundToTemplate(template, normalizedSettings);
  });

  if (dimensionsChanged) {
    await store.renderTemplate?.();
    await waitForCanvasReady(getFabricCanvas(instance));
  }

  applyBackgroundToCanvas(
    getFabricCanvas(instance),
    normalizedSettings,
    templates[currentIndex]
  );
  syncTemplate(instance);
};

const dataUrlToBlob = (dataUrl: string): Blob => {
  const [header, body] = dataUrl.split(",");
  const mime = header?.match(/data:(.*?);/)?.[1] || "image/png";
  const binary = atob(body || "");
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mime });
};

export const resolveExportPageRange = (
  scope: "all" | "current"
): "all" | "current" => (scope === "current" ? "current" : "all");

const getExportPageIndexes = (
  instance: PDFEditorInstance | null,
  scope: "all" | "current"
): number[] => {
  const store = getTemplatesStore(instance);
  const templates = store?.templates ?? [];
  if (!templates.length) return [];

  if (scope === "current") {
    return [store?.templateIndex ?? 0];
  }

  return templates.map((_, index) => index);
};

const BASE_EXPORT_DPI = 72;
const MAX_EXPORT_EDGE_PX = 4096;

const WORKSPACE_HELPER_IDS = new Set([
  "WorkSpaceClipType",
  "WorkSpaceSafeType",
  "WorkSpaceMaskType",
  "WorkSpaceLineType",
]);

interface ExportCurrentPageImageOptions {
  readonly dpi?: number;
  readonly ignoreBlankEdges?: boolean;
  /**
   * Explicit background color to paint before rasterizing. Use for opaque
   * formats (JPEG) so transparent regions render white instead of black.
   * When omitted, behavior falls back to the ignoreBlankEdges default.
   */
  readonly background?: string;
}

interface ExportCropRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

interface HiddenExportObject {
  readonly object: FabricObjectLike;
  readonly visible: boolean;
}

const getExportCropRect = (
  canvas: FabricCanvasLike,
  ignoreBlankEdges: boolean
): ExportCropRect => {
  const objects = canvas.getObjects?.() ?? [];
  const workspace = objects.find((object) => object.id === "WorkSpaceDrawType");

  if (!ignoreBlankEdges && workspace) {
    return {
      left: workspace.left ?? 0,
      top: workspace.top ?? 0,
      width: workspace.width ?? canvas.getWidth?.() ?? 0,
      height: workspace.height ?? canvas.getHeight?.() ?? 0,
    };
  }

  if (workspace) {
    return {
      left: workspace.left ?? 0,
      top: workspace.top ?? 0,
      width: workspace.width ?? 0,
      height: workspace.height ?? 0,
    };
  }

  const contentObjects = objects.filter(
    (object) => !object.id || !WORKSPACE_IDS.has(object.id)
  );
  let minLeft = Infinity;
  let minTop = Infinity;
  let maxRight = -Infinity;
  let maxBottom = -Infinity;

  contentObjects.forEach((object) => {
    const left = object.left ?? 0;
    const top = object.top ?? 0;
    const width = object.getScaledWidth?.() ?? object.width ?? 0;
    const height = object.getScaledHeight?.() ?? object.height ?? 0;

    minLeft = Math.min(minLeft, left);
    minTop = Math.min(minTop, top);
    maxRight = Math.max(maxRight, left + width);
    maxBottom = Math.max(maxBottom, top + height);
  });

  if (!Number.isFinite(minLeft)) {
    return {
      left: 0,
      top: 0,
      width: canvas.getWidth?.() ?? 0,
      height: canvas.getHeight?.() ?? 0,
    };
  }

  return {
    left: minLeft,
    top: minTop,
    width: Math.max(1, maxRight - minLeft),
    height: Math.max(1, maxBottom - minTop),
  };
};

const hideWorkspaceForExport = (
  canvas: FabricCanvasLike,
  format: "png" | "jpeg",
  ignoreBlankEdges: boolean
): HiddenExportObject[] => {
  if (!ignoreBlankEdges) return [];

  const hideIds = format === "jpeg" ? WORKSPACE_HELPER_IDS : WORKSPACE_IDS;
  const hidden: HiddenExportObject[] = [];

  canvas.getObjects?.().forEach((object) => {
    if (!object.id || !hideIds.has(object.id)) return;

    hidden.push({
      object,
      visible: object.visible !== false,
    });
    object.set?.({ visible: false });
    Object.assign(object, { visible: false });
  });

  return hidden;
};

const restoreHiddenExportObjects = (
  canvas: FabricCanvasLike,
  hidden: HiddenExportObject[]
): void => {
  hidden.forEach(({ object, visible }) => {
    object.set?.({ visible });
    Object.assign(object, { visible });
  });
  canvas.renderAll?.();
};

/**
 * Rasterizes a single Fabric canvas (live, active, or a detached offscreen page
 * canvas) to an image Blob. Kept separate from {@link exportCurrentPageImage} so
 * continuous-mode export can rasterize each page's own canvas without touching
 * the shared/active canvas.
 */
const rasterizePageCanvasToBlob = (
  canvas: FabricCanvasLike,
  format: "png" | "jpeg",
  quality: number,
  options?: ExportCurrentPageImageOptions
): Blob => {
  if (!canvas?.toDataURL) {
    throw new Error("Canvas image export is not available");
  }

  const ignoreBlankEdges = options?.ignoreBlankEdges ?? false;
  const hidden = hideWorkspaceForExport(canvas, format, ignoreBlankEdges);
  const previousBackground = canvas.backgroundColor;

  if (options?.background) {
    canvas.backgroundColor = options.background;
  } else if (ignoreBlankEdges) {
    canvas.backgroundColor = "rgba(255,255,255,0)";
  }

  const zoom = canvas.getZoom?.() ?? 1;
  const viewportTransform = canvas.viewportTransform ?? [1, 0, 0, 1, 0, 0];
  const crop = getExportCropRect(canvas, ignoreBlankEdges);
  const targetDpi = options?.dpi ?? BASE_EXPORT_DPI;
  let dpiScale = targetDpi / BASE_EXPORT_DPI;
  const cropWidth = crop.width * zoom;
  const cropHeight = crop.height * zoom;
  const longestEdge = Math.max(cropWidth, cropHeight) * dpiScale;

  if (longestEdge > MAX_EXPORT_EDGE_PX && longestEdge > 0) {
    dpiScale *= MAX_EXPORT_EDGE_PX / longestEdge;
  }

  canvas.discardActiveObject?.();
  canvas.renderAll?.();

  try {
    const dataUrl = canvas.toDataURL({
      format,
      quality,
      multiplier: (1 / zoom) * dpiScale,
      width: cropWidth,
      height: cropHeight,
      left: crop.left * zoom + (viewportTransform[4] ?? 0),
      top: crop.top * zoom + (viewportTransform[5] ?? 0),
    });
    if (!dataUrl) throw new Error("Canvas image export is not available");

    return dataUrlToBlob(dataUrl);
  } finally {
    canvas.backgroundColor = previousBackground;
    restoreHiddenExportObjects(canvas, hidden);
  }
};

export const exportCurrentPageImage = (
  instance: PDFEditorInstance | null,
  format: "png" | "jpeg",
  quality: number,
  options?: ExportCurrentPageImageOptions
): Blob => {
  activatePinia(instance);

  const canvas = getFabricCanvas(instance);
  if (!canvas?.toDataURL) {
    throw new Error("Canvas image export is not available");
  }

  return rasterizePageCanvasToBlob(canvas, format, quality, options);
};

/**
 * Temporarily resets the canvas viewport to identity so {@link exportCurrentPageImage}
 * rasterizes the page in its native (un-rotated) orientation. Rotation is then
 * re-applied as PDF `/Rotate` metadata on the exported page. Returns a cleanup
 * function that restores the original viewport transform.
 */
const withIdentityViewport = (
  canvas: FabricCanvasLike | null
): (() => void) => {
  if (!canvas) return () => undefined;

  const canvasWithViewport = canvas as FabricCanvasLike & {
    setViewportTransform?: (transform: number[]) => void;
    viewportTransform?: number[];
  };
  const original = Array.isArray(canvasWithViewport.viewportTransform)
    ? [...canvasWithViewport.viewportTransform]
    : null;

  applyViewportTransform(canvas, [1, 0, 0, 1, 0, 0]);

  return () => {
    if (original) applyViewportTransform(canvas, original);
  };
};

/** True when the SDK exposes `renderTemplateToCanvas` (required for export). */
const supportsOffscreenRender = (instance: PDFEditorInstance): boolean =>
  typeof (instance as unknown as UnknownRecord).renderTemplateToCanvas ===
  "function";

/**
 * Rasterizes a single page (0-based `pageIndex`) from a detached offscreen Fabric
 * canvas built by the SDK's `renderTemplateToCanvas`, so the live per-page
 * canvases and scroll viewport are never touched (the single-canvas
 * `store.renderTemplate` path calls `canvas.clear()` and hangs/corrupts in the
 * multi-canvas continuous layout). Returns null when the page is still streaming
 * or the offscreen build/rasterize failed, so callers can skip it.
 */
const rasterizeOffscreenPage = async (
  instance: PDFEditorInstance,
  pageIndex: number,
  format: "png" | "jpeg",
  quality: number,
  options: ExportCurrentPageImageOptions
): Promise<Blob | null> => {
  let offscreen: FabricCanvasLike | null = null;
  try {
    // callSdk keeps `this` bound so renderTemplateToCanvas can read `this.pinia`.
    offscreen =
      (await callSdk<Promise<FabricCanvasLike | null>>(
        instance,
        "renderTemplateToCanvas" as keyof PDFEditorInstance,
        pageIndex + 1
      )) ?? null;
  } catch (err) {
    console.error("[export] renderTemplateToCanvas failed", pageIndex, err);

    return null;
  }

  if (!offscreen) return null;

  try {
    return rasterizePageCanvasToBlob(offscreen, format, quality, options);
  } catch (err) {
    console.error("[export] failed to rasterize page", pageIndex, err);

    return null;
  } finally {
    (offscreen as unknown as { dispose?: () => void }).dispose?.();
  }
};

/**
 * Per-page snapshot captured at load time so PDF export can reuse the original
 * vector page for pages the user never edited (keeps text selectable and file
 * size close to the source instead of rasterizing every page):
 *  - `sigById`: a normalized, edit-sensitive signature of a page's user objects,
 *    keyed by the template's stable id. If it still matches at export time the
 *    page is unchanged and the original PDF page is copied verbatim.
 *  - `originalIndexById`: template id → its 0-based page index in the source PDF,
 *    so reused pages map back correctly even after reordering.
 */
interface ExportBaseline {
  readonly sigById: Map<string, string>;
  readonly originalIndexById: Map<string, number>;
}

const exportBaselines = new WeakMap<PDFEditorInstance, ExportBaseline>();

/** Object id prefixes for SDK chrome (page workspace, watermarks) — not content. */
const NON_USER_OBJECT_ID_PREFIXES = [
  "WorkSpace",
  "watermark",
  "loading-placeholder",
];

const isUserContentObject = (
  object: FabricObjectLike,
  backgroundLayerIds: ReadonlySet<string>
): boolean => {
  const id = String(object?.id ?? "");
  if (!id) return true;

  if (backgroundLayerIds.has(id)) return false;

  return !NON_USER_OBJECT_ID_PREFIXES.some((prefix) => id.startsWith(prefix));
};

const roundSignatureNumber = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.round(value * 100) / 100
    : 0;

// Curated, edit-sensitive props. Every editing operation the SDK supports
// (move/resize/rotate/restyle/edit text/add/remove) changes at least one of
// these, so an unchanged signature reliably means "not edited". Serialization
// noise from non-listed default props is ignored, so simply mounting/scrolling
// a page never falsely marks it edited.
const SIGNATURE_STRING_PROPS = [
  "type",
  "text",
  "src",
  "fill",
  "stroke",
  "fontFamily",
  "fontWeight",
  "fontStyle",
  "textAlign",
  "underline",
  "linethrough",
  "flipX",
  "flipY",
] as const;
const SIGNATURE_NUMBER_PROPS = [
  "left",
  "top",
  "width",
  "height",
  "scaleX",
  "scaleY",
  "angle",
  "skewX",
  "skewY",
  "opacity",
  "strokeWidth",
  "fontSize",
  "charSpacing",
  "lineHeight",
] as const;

const objectSignature = (object: FabricObjectLike): string => {
  const record = object as UnknownRecord;
  const parts: string[] = [];

  for (const prop of SIGNATURE_STRING_PROPS) {
    parts.push(String(record[prop] ?? ""));
  }
  for (const prop of SIGNATURE_NUMBER_PROPS) {
    parts.push(String(roundSignatureNumber(record[prop])));
  }

  const children = record.objects as FabricObjectLike[] | undefined;
  if (Array.isArray(children)) {
    parts.push(`[${children.map(objectSignature).join("~")}]`);
  }

  return parts.join("|");
};

/** djb2 hash — keeps the per-page signature compact for large documents. */
const hashSignature = (input: string): string => {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33 + input.charCodeAt(i)) | 0;
  }

  return hash.toString(36);
};

const computeTemplateUserSignature = (template: TemplateLike): string => {
  const objects = template.objects ?? [];
  const backgroundLayerIds = new Set<string>(
    template.pageBackgroundLayerIds ?? []
  );

  const signature = objects
    .filter((object) => isUserContentObject(object, backgroundLayerIds))
    .map(objectSignature)
    .join("\n");

  return hashSignature(signature);
};

/**
 * Records the unedited baseline for every currently-loaded page. Safe to call
 * repeatedly as pages stream in — each page is captured once, before edits, so
 * later calls never overwrite a snapshot with post-edit content.
 */
export const captureExportBaseline = (
  instance: PDFEditorInstance | null
): void => {
  if (!instance) return;

  const store = getTemplatesStore(instance);
  const templates = store?.templates as TemplateLike[] | undefined;
  if (!templates || templates.length === 0) return;

  let existing = exportBaselines.get(instance);
  if (!existing) {
    existing = { sigById: new Map(), originalIndexById: new Map() };
    exportBaselines.set(instance, existing);
  }

  const baseline = existing;

  templates.forEach((template, index) => {
    if (!template || (template as UnknownRecord).isLoading) return;

    const id = String(template.id ?? "");
    if (!id || baseline.sigById.has(id)) return;

    baseline.sigById.set(id, computeTemplateUserSignature(template));
    baseline.originalIndexById.set(id, index);
  });
};

/** Loads the original PDF bytes (data:, blob:, or http[s] URL) for vector reuse. */
const fetchSourcePdfBytes = async (
  source: string | null | undefined
): Promise<Uint8Array | null> => {
  if (!source) return null;

  try {
    const response = await fetch(source);
    if (!response.ok) return null;

    return new Uint8Array(await response.arrayBuffer());
  } catch (err) {
    console.warn("[export] could not load source PDF for vector reuse", err);

    return null;
  }
};

/**
 * Rasterizes the given template page indexes (in order) into a single PDF Blob.
 * Page rotation is stamped via pdf-lib's `setRotation` so PDF viewers render
 * the page rotated without bloating output size with a pre-rotated image.
 *
 * Pages the user never edited are copied verbatim from the original PDF
 * (`sourcePdf`) so their vector text stays selectable and small; only edited or
 * newly-added pages are rasterized. Without a baseline or source bytes it
 * cleanly falls back to rasterizing every page.
 *
 * Shared backend for {@link exportDocumentPdf} and {@link exportDocumentPdfRange}.
 */
const exportPageIndexesToPdf = async (
  instance: PDFEditorInstance | null,
  settings: EditorExportSettings,
  pageIndexes: readonly number[],
  sourcePdf?: string | null
): Promise<Blob> => {
  activatePinia(instance);

  const store = getTemplatesStore(instance);
  if (!instance || !store || pageIndexes.length === 0) {
    throw new Error("No pages to export");
  }

  if (!supportsOffscreenRender(instance)) {
    throw new Error("PDF export requires SDK.renderTemplateToCanvas");
  }

  // Sync the active page's live edits into its template so the offscreen render
  // reflects the latest changes.
  persistCanvasToCurrentTemplate(instance);

  const { PDFDocument, degrees } = await loadPdfLib();
  const pdfDoc = await PDFDocument.create();
  const rotations = getRotations(instance);
  const templates = (store.templates ?? []) as TemplateLike[];

  // Vector reuse: load the original PDF and figure out which output pages are
  // unchanged so they can be copied verbatim (selectable text, tiny) instead of
  // rasterized. Needs both a pre-edit baseline and parseable source bytes;
  // without either we transparently rasterize everything.
  const baseline = exportBaselines.get(instance);
  const sourceBytes = baseline ? await fetchSourcePdfBytes(sourcePdf) : null;

  let sourceDoc: Awaited<ReturnType<typeof PDFDocument.load>> | null = null;
  let sourcePageCount = 0;
  if (sourceBytes) {
    try {
      sourceDoc = await PDFDocument.load(sourceBytes, {
        ignoreEncryption: true,
      });
      sourcePageCount = sourceDoc.getPageCount();
    } catch (err) {
      console.warn(
        "[export] source PDF unreadable; rasterizing all pages",
        err
      );
      sourceDoc = null;
    }
  }

  // For each output page, the original page index to copy, or null to rasterize.
  const reusePlan: (number | null)[] = pageIndexes.map((pageIndex) => {
    if (!sourceDoc || !baseline) return null;

    const template = templates[pageIndex];
    const id = template ? String(template.id ?? "") : "";
    if (!id) return null;

    const originalIndex = baseline.originalIndexById.get(id);
    const baseSignature = baseline.sigById.get(id);
    if (
      originalIndex === undefined ||
      originalIndex >= sourcePageCount ||
      baseSignature === undefined
    ) {
      return null;
    }

    // Unchanged user content → safe to reuse the original vector page.
    return computeTemplateUserSignature(template) === baseSignature
      ? originalIndex
      : null;
  });

  const reuseIndices = reusePlan.filter(
    (value): value is number => value !== null
  );
  // One copyPages call dedups shared resources (fonts/images), keeping output
  // small; copied pages come back in the same order as `reuseIndices`.
  const copiedPages =
    sourceDoc && reuseIndices.length > 0
      ? await pdfDoc.copyPages(sourceDoc, reuseIndices)
      : [];
  let copyCursor = 0;

  // Rasterized pages must be sized in PDF points (not image pixels) so they
  // match the reused vector pages' physical size. Prefer the original page's
  // size (rotation-aware) so an edited page lines up exactly with its unedited
  // neighbours; fall back to the template's render size for newly-added pages.
  const rasterPageSizePt = (
    pageIndex: number
  ): { width: number; height: number } | null => {
    const template = templates[pageIndex];
    const id = template ? String(template.id ?? "") : "";
    const originalIndex = baseline?.originalIndexById.get(id);

    if (
      sourceDoc &&
      originalIndex !== undefined &&
      originalIndex < sourcePageCount
    ) {
      const srcPage = sourceDoc.getPage(originalIndex);
      const { width, height } = srcPage.getSize();
      const angle = ((srcPage.getRotation().angle % 360) + 360) % 360;

      return angle === 90 || angle === 270
        ? { width: height, height: width }
        : { width, height };
    }

    if (template?.width && template?.height) {
      return { width: template.width, height: template.height };
    }

    return null;
  };

  for (let slot = 0; slot < pageIndexes.length; slot += 1) {
    const pageIndex = pageIndexes[slot];
    const userRotation = normalizeRotation(rotations[pageIndex] ?? 0);
    const reuseIndex = reusePlan[slot];

    if (reuseIndex !== null && copiedPages[copyCursor]) {
      const copied = copiedPages[copyCursor];
      copyCursor += 1;

      // The copied page keeps the source's own /Rotate; add the user's rotation
      // (page rotation isn't an object edit, so rotated-only pages still reuse).
      if (userRotation !== 0) {
        copied.setRotation(
          degrees((copied.getRotation().angle + userRotation) % 360)
        );
      }

      pdfDoc.addPage(copied);

      continue;
    }

    // Edited / added page (or missing source) → rasterize.
    // JPEG (opaque white bg) rather than PNG: PNG encoding of a 300-DPI page
    // plus pdf-lib's embedPng (zlib) dominate export time. JPEG encodes far
    // faster, embeds via embedJpg (no inflate), and produces a much smaller PDF
    // — a large speedup with no visible loss for document pages.
    const jpegBlob = await rasterizeOffscreenPage(
      instance,
      pageIndex,
      "jpeg",
      Math.max(settings.quality, 0.85),
      {
        dpi: settings.dpi,
        ignoreBlankEdges: settings.ignoreBlankEdges,
        background: "#ffffff",
      }
    );

    if (!jpegBlob) continue; // page still streaming / failed — skip

    try {
      const jpegBytes = await jpegBlob.arrayBuffer();
      const image = await pdfDoc.embedJpg(jpegBytes);
      const size = rasterPageSizePt(pageIndex);
      const pageWidth = size?.width ?? image.width;
      const pageHeight = size?.height ?? image.height;
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });

      if (userRotation !== 0) {
        page.setRotation(degrees(userRotation));
      }
    } catch (err) {
      console.error("[export] failed to embed page", pageIndex, err);
    }
  }

  const bytes = await pdfDoc.save();

  return new Blob([Uint8Array.from(bytes)], { type: "application/pdf" });
};

/**
 * PDF export that preserves the original vector pages for anything the user
 * didn't edit and rasterizes only edited/added pages. Pass `sourcePdf` (the
 * original document URL/data URL) to enable vector reuse; omit it to rasterize
 * every page.
 */
export const exportDocumentPdf = (
  instance: PDFEditorInstance | null,
  settings: EditorExportSettings,
  sourcePdf?: string | null
): Promise<Blob> =>
  exportPageIndexesToPdf(
    instance,
    settings,
    getExportPageIndexes(instance, settings.scope),
    sourcePdf
  );

export interface PageRange {
  /** 1-indexed start page, inclusive. */
  readonly start: number;
  /** 1-indexed end page, inclusive. */
  readonly end: number;
}

/**
 * Mirrors `pdf-actions`' `splitPDF(pdfDoc, [start, end])` for the editor:
 * exports only pages in `range` (1-indexed, inclusive) as a single PDF Blob.
 *
 * Goes through the same rasterization + `/Rotate` pipeline as
 * {@link exportDocumentPdf}, so edits and per-page rotation are preserved.
 */
export const exportDocumentPdfRange = (
  instance: PDFEditorInstance | null,
  settings: EditorExportSettings,
  range: PageRange,
  sourcePdf?: string | null
): Promise<Blob> => {
  const pageCount = getTemplatePageCount(instance);
  if (pageCount === 0) {
    return Promise.reject(new Error("No pages to export"));
  }

  const start = Math.max(1, Math.min(range.start, range.end));
  const end = Math.min(pageCount, Math.max(range.start, range.end));
  const pageIndexes: number[] = [];
  for (let page = start; page <= end; page += 1) {
    pageIndexes.push(page - 1);
  }

  return exportPageIndexesToPdf(instance, settings, pageIndexes, sourcePdf);
};

export type MergePdfSource = Blob | ArrayBuffer | Uint8Array;

/**
 * Concatenates multiple PDFs into one, in the order given. Mirrors
 * `pdf-actions`' `mergePDF(filesDocArray)` but accepts raw blobs/bytes instead
 * of pre-loaded `PDFDocument` objects so callers don't need to import pdf-lib.
 *
 * Pages are copied via `pdf-lib`'s `copyPages` — the source files' `/Rotate`
 * metadata, fonts, and vector content are preserved verbatim.
 */
export const mergePdfBlobs = async (
  sources: readonly MergePdfSource[]
): Promise<Blob> => {
  if (sources.length === 0) {
    throw new Error("No PDFs to merge");
  }

  const { PDFDocument } = await loadPdfLib();
  const merged = await PDFDocument.create();

  for (const source of sources) {
    let bytes: Uint8Array;
    if (source instanceof Blob) {
      bytes = new Uint8Array(await source.arrayBuffer());
    } else if (source instanceof Uint8Array) {
      bytes = source;
    } else {
      bytes = new Uint8Array(source);
    }

    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  const out = await merged.save();

  return new Blob([Uint8Array.from(out)], { type: "application/pdf" });
};

/**
 * Convenience helper: exports the current editor document (honoring edits and
 * rotations via {@link exportDocumentPdf}) and appends the pages of every
 * `additionalPdfs` file to the result. Returns a single merged PDF Blob.
 */
export const exportMergedPdf = async (
  instance: PDFEditorInstance | null,
  settings: EditorExportSettings,
  additionalPdfs: readonly MergePdfSource[]
): Promise<Blob> => {
  const editorPdf = await exportDocumentPdf(instance, settings);
  if (additionalPdfs.length === 0) return editorPdf;

  return mergePdfBlobs([editorPdf, ...additionalPdfs]);
};

/**
 * Returns a rotated copy of `source` as a blob in the requested format.
 * For 90/270° rotations the output bitmap dimensions are swapped.
 */
const rotateImageBlob = async (
  source: Blob,
  rotation: 0 | 90 | 180 | 270,
  format: "png" | "jpeg",
  quality: number
): Promise<Blob> => {
  if (rotation === 0) return source;

  const objectUrl = URL.createObjectURL(source);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = objectUrl;
    });

    const isQuarterTurn = rotation === 90 || rotation === 270;
    const targetWidth = isQuarterTurn
      ? image.naturalHeight
      : image.naturalWidth;
    const targetHeight = isQuarterTurn
      ? image.naturalWidth
      : image.naturalHeight;

    const canvasElement = document.createElement("canvas");
    canvasElement.width = targetWidth;
    canvasElement.height = targetHeight;

    const context = canvasElement.getContext("2d");
    if (!context) throw new Error("2D canvas context unavailable");

    if (format === "jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, targetWidth, targetHeight);
    }

    context.translate(targetWidth / 2, targetHeight / 2);
    context.rotate((rotation * Math.PI) / 180);
    context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

    return await new Promise<Blob>((resolve, reject) => {
      canvasElement.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to encode rotated image"));
        },
        format === "jpeg" ? "image/jpeg" : "image/png",
        quality
      );
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

/** Rasterizes pages and packs them into a single ZIP (one image per page). */
export const exportDocumentImages = async (
  instance: PDFEditorInstance | null,
  format: "png" | "jpeg",
  settings: EditorExportSettings
): Promise<Blob> => {
  activatePinia(instance);

  const store = getTemplatesStore(instance);
  const pageIndexes = getExportPageIndexes(instance, settings.scope);
  if (!instance || !store || pageIndexes.length === 0) {
    throw new Error("No pages to export");
  }

  if (!supportsOffscreenRender(instance)) {
    throw new Error("Image export requires SDK.renderTemplateToCanvas");
  }

  // Sync the active page's live edits into its template so the offscreen render
  // reflects the latest changes.
  persistCanvasToCurrentTemplate(instance);

  const fileExtension = format === "jpeg" ? "jpg" : "png";
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const rotations = getRotations(instance);

  for (const pageIndex of pageIndexes) {
    // Rasterize each page from its own detached offscreen canvas (see
    // rasterizeOffscreenPage) so live per-page canvases are untouched. JPEG gets
    // an opaque white background so transparent regions don't render black.
    const nativeBlob = await rasterizeOffscreenPage(
      instance,
      pageIndex,
      format,
      settings.quality,
      {
        dpi: settings.dpi,
        ignoreBlankEdges: settings.ignoreBlankEdges,
        background: format === "jpeg" ? "#ffffff" : undefined,
      }
    );

    if (!nativeBlob) continue; // page still streaming / failed — skip

    const pageRotation = normalizeRotation(rotations[pageIndex] ?? 0);
    const imageBlob = await rotateImageBlob(
      nativeBlob,
      pageRotation,
      format,
      settings.quality
    );

    zip.file(`page-${pageIndex + 1}.${fileExtension}`, imageBlob);
  }

  return zip.generateAsync({ type: "blob" });
};
