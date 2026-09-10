import {
  encodeData,
  renderer25D,
  rendererCircle,
  rendererDSJ,
  rendererFuncA,
  rendererFuncB,
  rendererImage,
  rendererLine,
  rendererLine2,
  rendererRandRect,
  rendererRandRound,
  rendererRect,
  rendererRound,
} from "beautify-qrcode";

import type {
  EditorQRCodeState,
  EditorQRCodeStyle,
  PDFEditorQRCodeOptions,
} from "./types";

export type { EditorQRCodeState, EditorQRCodeStyle } from "./types";

export interface EditorQRCodeOption {
  readonly codeStyle: EditorQRCodeStyle;

  readonly codeSpace: boolean;

  readonly codeError: number;
}

export const QR_CODE_STYLES: ReadonlyArray<{
  readonly id: EditorQRCodeStyle;

  readonly label: string;
}> = [
  { id: "A1", label: "A1" },

  { id: "A2", label: "A2" },

  { id: "A3", label: "A3" },

  { id: "SP1", label: "SP1" },

  { id: "SP2", label: "SP2" },

  { id: "SP3", label: "SP3" },

  { id: "B1", label: "B1" },

  { id: "C1", label: "C1" },

  { id: "A_a1", label: "A_a1" },

  { id: "A_a2", label: "A_a2" },

  { id: "A_b1", label: "A_b1" },

  { id: "A_b2", label: "A_b2" },
];

const ERROR_LEVEL_TO_CODE: Record<
  EditorQRCodeState["errorCorrectionLevel"],
  number
> = {
  L: 0,

  M: 1,

  Q: 2,

  H: 3,
};

/** beautify-qrcode correctLevel: 1=7%, 0=15%, 3=25%, 2=30% */

const ERROR_LEVEL_TO_BEAUTIFY: Record<
  EditorQRCodeState["errorCorrectionLevel"],
  number
> = {
  L: 1,

  M: 0,

  Q: 3,

  H: 2,
};

const CODE_TO_ERROR_LEVEL: Record<
  number,
  EditorQRCodeState["errorCorrectionLevel"]
> = {
  0: "L",

  1: "M",

  2: "Q",

  3: "H",
};

export const ERROR_CORRECTION_OPTIONS: ReadonlyArray<{
  readonly id: EditorQRCodeState["errorCorrectionLevel"];

  readonly label: string;
}> = [
  { id: "L", label: "7%" },

  { id: "M", label: "15%" },

  { id: "Q", label: "25%" },

  { id: "H", label: "30%" },
];

/** Subtle tile pattern for C1 image style (matches SDK image QR). */

const C1_BACKGROUND_PATTERN =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">' +
      '<rect width="32" height="32" fill="#f3f4f6"/>' +
      '<path d="M0 16h32M16 0v32" stroke="#e5e7eb" stroke-width="1"/>' +
      "</svg>"
  );

type QRRenderer = (encoded: string) => string;

const QR_STYLE_RENDERERS: Record<EditorQRCodeStyle, QRRenderer> = {
  A1: (encoded) => rendererRect(encoded),

  A2: (encoded) => rendererRound(encoded),

  A3: (encoded) => rendererRandRound(encoded),

  SP1: (encoded) => rendererDSJ(encoded),

  SP2: (encoded) => rendererRandRect(encoded),

  SP3: (encoded) => rendererCircle(encoded),

  B1: (encoded) => renderer25D(encoded),

  C1: (encoded) =>
    rendererImage(encoded, {
      backgroudImage: C1_BACKGROUND_PATTERN,

      type: 1,

      size: 1,
    }),

  A_a1: (encoded) => rendererLine(encoded),

  A_a2: (encoded) => rendererLine2(encoded),

  A_b1: (encoded) => rendererFuncA(encoded),

  A_b2: (encoded) => rendererFuncB(encoded),
};

export const mapOptionsToCodeOption = (
  options?: PDFEditorQRCodeOptions & { codeStyle?: EditorQRCodeStyle }
): EditorQRCodeOption => ({
  codeStyle: options?.codeStyle ?? "A1",

  codeSpace: (options?.margin ?? 4) > 0,

  codeError: ERROR_LEVEL_TO_CODE[options?.errorCorrectionLevel ?? "M"],
});

export const parseQRCodeState = (
  object: {
    codeContent?: string;

    codeOption?: unknown;

    strokeWidth?: number;

    stroke?: string;

    shadow?: unknown;
  } | null
): EditorQRCodeState => {
  const codeOption = object?.codeOption as
    | Partial<EditorQRCodeOption>
    | undefined;

  const codeError =
    typeof codeOption?.codeError === "number" ? codeOption.codeError : 1;

  return {
    content: typeof object?.codeContent === "string" ? object.codeContent : "",

    codeStyle: (codeOption?.codeStyle as EditorQRCodeStyle) ?? "A1",

    margin: codeOption?.codeSpace === false ? "none" : "standard",

    errorCorrectionLevel: CODE_TO_ERROR_LEVEL[codeError] ?? "M",

    border: Boolean(object?.strokeWidth && object.strokeWidth > 0),

    shadow: Boolean(object?.shadow),
  };
};

export const DEFAULT_QR_CODE_CONTENT = "https://onlydoc.com";

export const DEFAULT_QR_CODE_OPTIONS: PDFEditorQRCodeOptions = {
  size: 160,

  errorCorrectionLevel: "M",

  margin: 4,

  border: false,

  shadow: false,

  angle: 0,
};

const svgToDataUrl = (svg: string): string =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/** Renders a styled QR code SVG via beautify-qrcode (SDK-compatible styles). */

export const buildQRCodeDataUrl = (
  state: Pick<
    EditorQRCodeState,
    "content" | "codeStyle" | "margin" | "errorCorrectionLevel"
  >,

  size: number
): string => {
  const pixelSize = Math.max(64, Math.round(size));

  const text = state.content.trim() || DEFAULT_QR_CODE_CONTENT;

  const encoded = encodeData({
    text,

    correctLevel: ERROR_LEVEL_TO_BEAUTIFY[state.errorCorrectionLevel],

    width: pixelSize,

    height: pixelSize,

    isSpace: state.margin === "standard",
  });

  const render = QR_STYLE_RENDERERS[state.codeStyle] ?? QR_STYLE_RENDERERS.A1;

  try {
    const svg = render(encoded);

    return svgToDataUrl(typeof svg === "string" ? svg : String(svg));
  } catch (error) {
    console.warn("[editor] QR style render failed, falling back to A1", error);

    return svgToDataUrl(rendererRect(encoded));
  }
};

/** @deprecated Use buildQRCodeDataUrl — qrserver ignores codeStyle. */

export const buildQRCodePreviewUrl = (
  content: string,

  size: number,

  errorLevel: EditorQRCodeState["errorCorrectionLevel"]
): string =>
  buildQRCodeDataUrl(
    {
      content,

      codeStyle: "A1",

      margin: "standard",

      errorCorrectionLevel: errorLevel,
    },

    size
  );
