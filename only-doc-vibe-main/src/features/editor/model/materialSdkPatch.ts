import type { PDFEditorInstance } from "./types";
import {
  callSdk,
  getFabricCanvas,
  recordHistorySnapshot,
  type FabricObjectLike,
} from "./sdkBindings";

const DEFAULT_SHAPE_SIZE = 200;

interface MaterialShapeOptions {
  readonly left?: number;
  readonly top?: number;
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly viewBox?: readonly [number, number];
  readonly pathFormula?: string;
  readonly special?: boolean;
  readonly outlined?: boolean;
}

interface MaterialLineOptions {
  readonly points: readonly { readonly x: number; readonly y: number }[];
  readonly startStyle?: string;
  readonly endStyle?: string;
  readonly style?: "solid" | "dashed";
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly isBroken?: boolean;
  readonly isCurve?: boolean;
  readonly isCubic?: boolean;
}

type EditorCanvas = NonNullable<ReturnType<typeof getFabricCanvas>>;

type NativeAddShape = (path: string, options?: Record<string, unknown>) => void;

// The SDK's real `addShape` is stashed here before we replace `instance.addShape`
// with the option-applying wrapper below. The wrapper MUST call this original
// (not `instance.addShape`, which now points at the wrapper) — otherwise it
// re-enters itself and recurses forever, the shape is never created, and nothing
// shows up on the page.
const NATIVE_ADD_SHAPE_KEY = "__materialNativeAddShape";

const getNativeAddShape = (
  instance: PDFEditorInstance
): NativeAddShape | null => {
  const fn = (instance as unknown as Record<string, unknown>)[
    NATIVE_ADD_SHAPE_KEY
  ];

  return typeof fn === "function" ? (fn as NativeAddShape) : null;
};

const getActiveObject = (
  instance: PDFEditorInstance,
  canvas: EditorCanvas
): FabricObjectLike | null => {
  const active = canvas.getActiveObject?.();
  if (active) return active;

  const pinia = (
    instance as unknown as {
      pinia?: { _s?: Map<string, { canvasObject?: unknown }> };
    }
  ).pinia;
  const mainStore = pinia?._s?.get("main") ?? pinia?._s?.get("MainStore");
  const canvasObject = mainStore?.canvasObject;

  return canvasObject && typeof canvasObject === "object"
    ? (canvasObject as FabricObjectLike)
    : null;
};

const applyShapeOptions = (
  object: FabricObjectLike,
  options: MaterialShapeOptions
): void => {
  const props: Partial<FabricObjectLike> = {};

  if (options.fill !== undefined) props.fill = options.fill;

  if (options.stroke !== undefined) props.stroke = options.stroke;

  if (options.strokeWidth !== undefined) {
    props.strokeWidth = options.strokeWidth;
  }

  if (options.pathFormula) {
    props.pathFormula = options.pathFormula;
  }

  if (Object.keys(props).length > 0) {
    object.set?.(props);
  }

  if (options.viewBox) {
    const [viewBoxWidth, viewBoxHeight] = options.viewBox;
    const maxDimension = Math.max(viewBoxWidth, viewBoxHeight);
    if (maxDimension > 0) {
      const scale = DEFAULT_SHAPE_SIZE / maxDimension;
      if (Math.abs(scale - 1) > 0.001) {
        object.scale?.(scale);
      }
    }
  }

  object.setCoords?.();
};

const insertShapeWithLegacySdk = (
  instance: PDFEditorInstance,
  path: string,
  options: MaterialShapeOptions
): void => {
  const canvas = getFabricCanvas(instance);
  if (!canvas) return;

  const nativeAddShape = getNativeAddShape(instance);
  if (nativeAddShape) {
    nativeAddShape(path, { left: options.left, top: options.top });
  } else {
    // No native `addShape` was captured (older SDK builds), so `instance.addShape`
    // was never overridden and calling it here is safe (no recursion).
    callSdk(instance, "addShape", path, {
      left: options.left,
      top: options.top,
    });
  }

  // Apply the material's own fill/stroke/scale to the freshly-created shape. The
  // SDK's createPathElement runs synchronously and selects the new path, so this
  // normally executes in the SAME frame — the shape never paints the SDK's
  // hardcoded orange default (#ff5e17) before switching to the material colour.
  // The setTimeout only covers the rare case where the object isn't selected yet.
  const applyToNewShape = (): boolean => {
    const object = getActiveObject(instance, canvas);
    if (!object) return false;

    applyShapeOptions(object, options);
    callSdk(instance, "refreshSelectionControls");
    canvas.requestRenderAll?.();
    canvas.renderAll?.();
    recordHistorySnapshot(instance);

    return true;
  };

  if (!applyToNewShape()) {
    window.setTimeout(applyToNewShape, 80);
  }
};

const insertLineWithLegacySdk = (
  instance: PDFEditorInstance,
  options: MaterialLineOptions
): void => {
  const canvas = getFabricCanvas(instance);
  if (!canvas) return;

  const fabricNamespace = (
    window as Window & {
      fabric?: {
        classRegistry?: {
          getClass: (
            name: string
          ) => new (...args: unknown[]) => FabricObjectLike;
        };
      };
    }
  ).fabric;

  const PolylineClass =
    fabricNamespace?.classRegistry?.getClass("Polyline") ??
    fabricNamespace?.classRegistry?.getClass("polyline");

  if (!PolylineClass) {
    const fallbackPath = options.points
      .map((point, index) =>
        index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
      )
      .join(" ");
    insertShapeWithLegacySdk(instance, fallbackPath, {
      fill: "",
      stroke: options.stroke ?? "#111111",
      strokeWidth: options.strokeWidth ?? 4,
    });

    return;
  }

  const center = canvas.getCenter?.() ?? { left: 400, top: 300 };
  const strokeDashArray =
    options.style === "dashed" ? ([8, 8] as [number, number]) : undefined;

  const useVertexControls = Boolean(
    options.isBroken || options.isCurve || options.isCubic
  );

  const element = new PolylineClass([...options.points], {
    left: center.left,
    top: center.top,
    strokeWidth: options.strokeWidth ?? 4,
    stroke: options.stroke ?? "#111111",
    fill: "",
    originX: "center",
    originY: "center",
    startStyle: options.startStyle ?? "",
    endStyle: options.endStyle ?? "",
    hasControls: true,
    hasBorders: true,
    vertexControls: useVertexControls,
    strokeDashArray,
    name: "line",
  });

  element.setCoords?.();
  canvas.viewportCenterObject?.(element);
  canvas.add?.(element);
  canvas.setActiveObject?.(element);
  callSdk(instance, "refreshSelectionControls");
  canvas.requestRenderAll?.();
  canvas.renderAll?.();
  recordHistorySnapshot(instance);
};

const PATCHED_FLAG = "__materialSdkPatched";

export const patchMaterialSdk = (instance: PDFEditorInstance): void => {
  const record = instance as unknown as Record<string, unknown>;
  if (record[PATCHED_FLAG]) return;

  if (typeof instance.addLine === "function") {
    record[PATCHED_FLAG] = true;

    return;
  }

  // Capture the SDK's native `addShape` BEFORE overriding it, so the wrapper can
  // delegate to the real implementation instead of calling itself recursively.
  if (typeof instance.addShape === "function") {
    record[NATIVE_ADD_SHAPE_KEY] = (instance.addShape as NativeAddShape).bind(
      instance
    );

    instance.addShape = (
      path: string,
      options: Record<string, unknown> = {}
    ) => {
      insertShapeWithLegacySdk(instance, path, options as MaterialShapeOptions);
    };
  }

  instance.addLine = (options: Record<string, unknown> = {}) => {
    insertLineWithLegacySdk(
      instance,
      options as unknown as MaterialLineOptions
    );
  };

  record[PATCHED_FLAG] = true;
};
