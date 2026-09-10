import { useCallback, useMemo } from "react";

import { navigateThroughURL } from "@/shared/lib/seo/navigate-through-url";

import { useEditor } from "./EditorContext";
import {
  EDITOR_ZOOM_MAX,
  EDITOR_ZOOM_MIN,
  EDITOR_ZOOM_STEP,
} from "./editorZoom";
import {
  addPageRendered,
  alignSelectedElement,
  callSdk,
  copySelectedElement,
  cutSelectedElement,
  deletePageRendered,
  getFabricCanvas,
  getPageSettings,
  lockSelectedElement,
  moveSelectedLayer,
  pasteSelectedElement,
  selectAllElements,
  recordHistorySnapshot,
  runHistory,
  setEditorPropertyPreview,
  updateSelectedElement,
  toggleCurvedTextPath,
  ensureBarCodeElementInitialized,
  ensureQRCodeElementInitialized,
  getSelectedElement,
  updateBarCodeElement,
  updateQRCodeElement,
  focusElementPropertiesPanel,
  fitEditorToScreen,
} from "./sdkBindings";
import {
  DEFAULT_BAR_CODE_CONTENT,
  DEFAULT_BAR_CODE_OPTIONS,
  mapToJsBarcodeOptions,
} from "./barCode";
import {
  DEFAULT_QR_CODE_CONTENT,
  DEFAULT_QR_CODE_OPTIONS,
  mapOptionsToCodeOption,
} from "./qrCode";
import type {
  EditorAlignCommand,
  EditorLayerDirection,
  FabricObjectLike,
} from "./sdkBindings";
import type { EditorBarCodeState, EditorQRCodeState } from "./types";
import type {
  EditorSelectedElement,
  PDFEditorBarCodeOptions,
  PDFEditorImageOptions,
  PDFEditorQRCodeOptions,
  PDFEditorTextOptions,
} from "./types";

type CanvasToolMode = "move" | "handMove";

interface FabricCanvas {
  isDrawingMode?: boolean;
  defaultCursor?: string;
  hoverCursor?: string;
  moveCursor?: string;
  selection?: boolean;
  skipTargetFind?: boolean;
  viewportTransform?: number[];
  discardActiveObject?: () => void;
  setCursor?: (cursor: string) => void;
  absolutePan?: (point: { x: number; y: number }) => void;
  getZoom?: () => number;
  on?: (
    eventName: string,
    handler: (event: FabricPointerEvent) => void
  ) => void;
  off?: (
    eventName: string,
    handler: (event: FabricPointerEvent) => void
  ) => void;
  requestRenderAll?: () => void;
  renderAll?: () => void;
}

interface FabricPointerEvent {
  readonly e?: MouseEvent;
  readonly viewportPoint?: { x: number; y: number };
}

const CANVAS_TOOL_OPTIONS: Record<
  CanvasToolMode,
  Pick<FabricCanvas, "defaultCursor" | "skipTargetFind" | "selection">
> = {
  move: {
    defaultCursor: "default",
    skipTargetFind: false,
    selection: true,
  },
  handMove: {
    defaultCursor: "grab",
    skipTargetFind: true,
    selection: false,
  },
};

const applyCanvasTool = (canvas: FabricCanvas, tool: CanvasToolMode): void => {
  const { defaultCursor, skipTargetFind, selection } =
    CANVAS_TOOL_OPTIONS[tool];

  canvas.defaultCursor = defaultCursor;
  canvas.hoverCursor = tool === "handMove" ? "grab" : "move";
  canvas.moveCursor = tool === "handMove" ? "grab" : "move";
  canvas.skipTargetFind = skipTargetFind;
  canvas.selection = selection;
  canvas.setCursor?.(defaultCursor ?? "default");
};

interface HandPanBindings {
  isDragging: boolean;
  startX: number;
  startY: number;
  vpt: number[] | undefined;
  onMouseDown: (event: FabricPointerEvent) => void;
  onMouseMove: (event: FabricPointerEvent) => void;
  onMouseUp: () => void;
}

const HAND_PAN_KEY = "__editorHandPanBindings" as const;

const teardownHandPan = (instance: unknown, canvas: FabricCanvas | null) => {
  const bag = instance as Record<string, unknown>;
  const bindings = bag[HAND_PAN_KEY] as HandPanBindings | undefined;

  if (!bindings) return;

  canvas?.off?.("mouse:down", bindings.onMouseDown);
  canvas?.off?.("mouse:move", bindings.onMouseMove);
  canvas?.off?.("mouse:up", bindings.onMouseUp);
  canvas?.off?.("mouse:out", bindings.onMouseUp);
  delete bag[HAND_PAN_KEY];
};

const setupHandPan = (instance: unknown, canvas: FabricCanvas) => {
  teardownHandPan(instance, canvas);

  const bindings: HandPanBindings = {
    isDragging: false,
    startX: 0,
    startY: 0,
    vpt: undefined,
    onMouseDown: (event) => {
      const point = event.viewportPoint;
      if (!point) return;

      bindings.isDragging = true;
      bindings.startX = point.x;
      bindings.startY = point.y;
      bindings.vpt = canvas.viewportTransform
        ? [...canvas.viewportTransform]
        : undefined;
      canvas.setCursor?.("grabbing");
    },
    onMouseMove: (event) => {
      if (!bindings.isDragging) return;

      const point = event.viewportPoint;
      const vpt = bindings.vpt;
      if (!point || !vpt) return;

      // Compute pan via inverse-affine math so rotated viewports (where
      // `getZoom()` returns 0 because Fabric reads `vt[0]`) still work.
      const det = (vpt[0] ?? 1) * (vpt[3] ?? 1) - (vpt[1] ?? 0) * (vpt[2] ?? 0);
      if (!det) return;

      const mouseDx = point.x - bindings.startX;
      const mouseDy = point.y - bindings.startY;
      const deltaX = ((vpt[3] ?? 1) * mouseDx - (vpt[2] ?? 0) * mouseDy) / det;
      const deltaY = (-(vpt[1] ?? 0) * mouseDx + (vpt[0] ?? 1) * mouseDy) / det;
      const panX = -((vpt[0] ?? 1) * deltaX + (vpt[2] ?? 0) * deltaY);
      const panY = -((vpt[1] ?? 0) * deltaX + (vpt[3] ?? 1) * deltaY);

      if (canvas.absolutePan) {
        canvas.absolutePan({ x: panX, y: panY });
      } else {
        const transform = canvas.viewportTransform;
        if (!transform) return;

        transform[4] = (vpt[4] ?? 0) + panX;
        transform[5] = (vpt[5] ?? 0) + panY;
        canvas.requestRenderAll?.();
        canvas.renderAll?.();
      }
    },
    onMouseUp: () => {
      bindings.isDragging = false;
      bindings.vpt = canvas.viewportTransform
        ? [...canvas.viewportTransform]
        : undefined;
      canvas.setCursor?.("grab");
    },
  };

  canvas.on?.("mouse:down", bindings.onMouseDown);
  canvas.on?.("mouse:move", bindings.onMouseMove);
  canvas.on?.("mouse:up", bindings.onMouseUp);
  canvas.on?.("mouse:out", bindings.onMouseUp);
  (instance as Record<string, unknown>)[HAND_PAN_KEY] = bindings;
};

// Subset of methods on PDFEditorInstance that we call by name. Resolving the
// method by name on the live instance and using `.apply(instance, args)`
// preserves the `this` binding the SDK methods rely on internally.
type MethodName =
  | "addText"
  | "addImage"
  | "addShape"
  | "addLine"
  | "addQRCode"
  | "addBarCode"
  | "addSignature"
  | "addWatermark"
  | "deleteSelected"
  | "duplicateSelected"
  | "selectAll"
  | "clearSelection"
  | "refreshSelectionControls"
  | "lockWorkspaceObjects";

export const useEditorActions = () => {
  const {
    instance,
    currentPage,
    setCurrentPage,
    zoom,
    setZoom,
    openDownload,
    isDocumentLoaded,
    locale,
    setSelectedElement,
    setPageSettings,
  } = useEditor();

  // SDK element-creation/manipulation methods (addText/addImage/addShape/QR/Bar/
  // Watermark/Signature/deleteSelected/duplicate/selectAll/clearSelection/
  // deletePage) all delegate to Vue composables that read from internal Pinia
  // stores populated by `loadPDF`. Two preconditions must hold:
  //   1. A PDF has been successfully loaded (isDocumentLoaded === true).
  //   2. The method is called with the SDK instance bound as `this`, otherwise
  //      `this.pinia` / `this.fabricCanvas` reads throw.
  const safe = (methodName: MethodName, ...args: unknown[]) => {
    if (!instance || !isDocumentLoaded) {
      console.warn(
        "[useEditorActions] action ignored — load a PDF before editing"
      );

      return;
    }

    const fn = (instance as unknown as Record<string, unknown>)[methodName];
    if (typeof fn !== "function") {
      console.warn(
        `[useEditorActions] SDK method "${methodName}" not available`
      );

      return;
    }

    try {
      (fn as (...a: unknown[]) => void).apply(instance, args);
      window.setTimeout(() => recordHistorySnapshot(instance), 120);
    } catch (err) {
      console.error(`[useEditorActions] ${methodName} failed`, err);
    }
  };

  const getCanvas = useCallback((): FabricCanvas | null => {
    return (getFabricCanvas(instance) as FabricCanvas | null) ?? null;
  }, [instance]);

  const applySelected = useCallback(
    (element: EditorSelectedElement | null) => {
      setSelectedElement(element);

      return element;
    },
    [setSelectedElement]
  );

  const refreshMaterialControls = useCallback(() => {
    if (!instance) return;

    callSdk(instance, "refreshSelectionControls");
  }, [instance]);

  const applyAfterCreate = useCallback(
    (options?: Partial<FabricObjectLike>) => {
      window.setTimeout(() => {
        refreshMaterialControls();

        if (!options || Object.keys(options).length === 0) return;

        applySelected(updateSelectedElement(instance, options));
      }, 80);
    },
    [applySelected, instance, refreshMaterialControls]
  );

  const applyZoom = useCallback(
    (nextZoom: number) => {
      if (!instance || !isDocumentLoaded) return;

      const clamped = Math.min(
        Math.max(EDITOR_ZOOM_MIN, nextZoom),
        EDITOR_ZOOM_MAX
      );

      callSdk(instance, "setZoom", clamped);
      setZoom(clamped);
    },
    [instance, isDocumentLoaded, setZoom]
  );

  return useMemo(
    () => ({
      // Navigation
      goHome: () => {
        if (typeof window === "undefined") return;

        window.location.href = navigateThroughURL("/", locale);
      },

      // History (includes page add/delete/restore via template snapshots)
      undo: async () => {
        if (!instance) return;

        const result = await runHistory(instance, "undo");
        if (!result) return;

        setSelectedElement(null);
        setPageSettings(getPageSettings(instance));
      },
      redo: async () => {
        if (!instance) return;

        const result = await runHistory(instance, "redo");
        if (!result) return;

        setSelectedElement(null);
        setPageSettings(getPageSettings(instance));
      },

      // Hand / pan mode — mirrors SDK FabricTool move/handMove options.
      toggleHand: (enabled: boolean) => {
        const canvas = getCanvas();
        if (!canvas) return;

        teardownHandPan(instance, canvas);
        canvas.isDrawingMode = false;
        applyCanvasTool(canvas, enabled ? "handMove" : "move");

        if (enabled) {
          canvas.discardActiveObject?.();
          if (instance) setupHandPan(instance, canvas);
        }

        canvas.renderAll?.();
      },

      // Zoom
      zoomIn: () => applyZoom(zoom + EDITOR_ZOOM_STEP),
      zoomOut: () => applyZoom(zoom - EDITOR_ZOOM_STEP),
      resetZoom: () => applyZoom(1),
      fitToScreen: () => {
        if (!instance || !isDocumentLoaded) return;

        fitEditorToScreen(instance);
      },

      // Selection
      deleteSelected: () => safe("deleteSelected"),
      duplicateSelected: () => safe("duplicateSelected"),
      selectAll: () => {
        selectAllElements(instance);
      },
      clearSelection: () => safe("clearSelection"),
      cutSelected: () => void cutSelectedElement(instance),
      copySelected: () => void copySelectedElement(instance),
      pasteSelected: () =>
        void pasteSelectedElement(instance).then((element) =>
          applySelected(element)
        ),
      alignSelected: (command: EditorAlignCommand) =>
        applySelected(alignSelectedElement(instance, command)),
      centerSelectedHorizontally: () =>
        applySelected(alignSelectedElement(instance, "horizontal")),
      centerSelectedVertically: () =>
        applySelected(alignSelectedElement(instance, "vertical")),
      moveSelectedLayer: (direction: EditorLayerDirection) =>
        moveSelectedLayer(instance, direction),
      bringSelectedToFront: () => moveSelectedLayer(instance, "front"),
      sendSelectedToBack: () => moveSelectedLayer(instance, "back"),
      lockSelected: (locked: boolean) =>
        applySelected(lockSelectedElement(instance, locked)),
      updateSelectedPreview: (options: Record<string, unknown>) => {
        if (!instance || !isDocumentLoaded) return;

        setEditorPropertyPreview(instance, true);
        updateSelectedElement(instance, options as Partial<FabricObjectLike>, {
          persist: false,
        });
      },
      updateSelected: (options: Record<string, unknown>) => {
        if (!instance || !isDocumentLoaded) return;

        setEditorPropertyPreview(instance, false);
        applySelected(
          updateSelectedElement(
            instance,
            options as Partial<FabricObjectLike>,
            {
              persist: true,
            }
          )
        );
      },

      // Text presets
      addText: (
        text = "Double-click to edit",
        options?: PDFEditorTextOptions
      ) => {
        safe("addText", text, options);
        applyAfterCreate(options as Partial<FabricObjectLike>);
      },
      addTitle: () => {
        const options = { fontSize: 32, fontWeight: "bold" as const };
        safe("addText", "Title", options);
        applyAfterCreate(options as Partial<FabricObjectLike>);
      },
      addSubtitle: () => {
        const options = { fontSize: 22, fontWeight: "bold" as const };
        safe("addText", "Subtitle", options);
        applyAfterCreate(options as Partial<FabricObjectLike>);
      },
      addBody: () => {
        const options = { fontSize: 14 };
        safe("addText", "Body text", options);
        applyAfterCreate(options as Partial<FabricObjectLike>);
      },
      addHollowText: () => {
        const options = {
          fontSize: 32,
          fontWeight: "bold" as const,
          hollow: true,
          fill: "transparent",
          stroke: "#111",
          strokeWidth: 1,
        };
        safe("addText", "Hollow", {
          ...options,
        });
        applyAfterCreate(options as Partial<FabricObjectLike>);
      },

      toggleCurvedTextPath: () => {
        if (!instance || !isDocumentLoaded) return;

        applySelected(toggleCurvedTextPath(instance));
      },

      // Image
      addImage: (url: string, options?: PDFEditorImageOptions) => {
        safe("addImage", url, options);
        applyAfterCreate(options as Partial<FabricObjectLike>);
      },

      // Material / shapes
      addShape: (path: string, options?: Record<string, unknown>) => {
        safe("addShape", path, options);
        applyAfterCreate(options as Partial<FabricObjectLike>);
      },

      addMaterialLine: (options: Record<string, unknown>) => {
        safe("addLine", options);
        applyAfterCreate({
          stroke: options.stroke as string | undefined,
          strokeWidth: options.strokeWidth as number | undefined,
          fill: "",
        });
      },

      addMaterialShape: (path: string, options?: Record<string, unknown>) => {
        safe("addShape", path, options);
        applyAfterCreate({
          fill: options?.fill as string | undefined,
          stroke: options?.stroke as string | undefined,
          strokeWidth: options?.strokeWidth as number | undefined,
        });
      },

      // Signature
      addSignature: (imageData: string) => {
        safe("addSignature", imageData);
        applyAfterCreate({ name: "signature" });
      },

      // Watermark
      addWatermark: (text: string, options?: PDFEditorTextOptions) => {
        safe("addWatermark", text, options);
        applyAfterCreate(options as Partial<FabricObjectLike>);
      },

      // QR / Barcode
      addQRCode: (
        content: string = DEFAULT_QR_CODE_CONTENT,
        options: PDFEditorQRCodeOptions = DEFAULT_QR_CODE_OPTIONS
      ) => {
        safe("addQRCode", content, mapOptionsToCodeOption(options));
        window.setTimeout(() => {
          void ensureQRCodeElementInitialized(instance, content, options).then(
            (element) => {
              applySelected(element ?? getSelectedElement(instance));
              focusElementPropertiesPanel();
            }
          );
        }, 450);
      },
      updateQRCode: (patch: Partial<EditorQRCodeState>) =>
        updateQRCodeElement(instance, patch).then((element) =>
          applySelected(element)
        ),
      addBarCode: (
        content: string = DEFAULT_BAR_CODE_CONTENT,
        options: PDFEditorBarCodeOptions = DEFAULT_BAR_CODE_OPTIONS
      ) => {
        safe("addBarCode", content, mapToJsBarcodeOptions(options));
        window.setTimeout(() => {
          void ensureBarCodeElementInitialized(instance, content, options).then(
            (element) => {
              applySelected(element ?? getSelectedElement(instance));
              focusElementPropertiesPanel();
            }
          );
        }, 450);
      },
      updateBarCode: (patch: Partial<EditorBarCodeState>) =>
        updateBarCodeElement(instance, patch).then((element) =>
          applySelected(element)
        ),

      // Pages — go through the templates store directly so the canvas
      // actually re-renders. The SDK's public addPage/goToPage only mutate
      // state without rendering.
      addPageAbove: async () => {
        if (!instance || !isDocumentLoaded) return;

        const next = await addPageRendered(instance, "above");
        if (next) setCurrentPage(next);
      },
      addPageBelow: async () => {
        if (!instance || !isDocumentLoaded) return;

        const next = await addPageRendered(instance, "below");
        if (next) setCurrentPage(next);
      },
      deletePage: () =>
        void deletePageRendered(instance, currentPage).then((next) => {
          if (next) setCurrentPage(next);
        }),

      // Readiness flag (true once a PDF is loaded and editing is safe)
      isReady: isDocumentLoaded && instance !== null,

      // Export modal
      openExport: openDownload,
    }),
    // `safe`/`callOnInstance` close over `instance` and `isDocumentLoaded`
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      instance,
      currentPage,
      zoom,
      setCurrentPage,
      openDownload,
      getCanvas,
      isDocumentLoaded,
      locale,
      applyAfterCreate,
      applySelected,
      applyZoom,
    ]
  );
};
