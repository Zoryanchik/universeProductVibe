import JsBarcode from "jsbarcode";

import type { EditorBarCodeState, PDFEditorBarCodeOptions } from "./types";

export type { EditorBarCodeState } from "./types";

export const BARCODE_FORMATS: ReadonlyArray<{
  readonly id: EditorBarCodeState["format"];
  readonly label: string;
}> = [
  { id: "CODE128", label: "CODE128" },
  { id: "CODE39", label: "CODE39" },
  { id: "EAN13", label: "EAN13" },
  { id: "EAN8", label: "EAN8" },
  { id: "UPC", label: "UPC" },
  { id: "ITF14", label: "ITF14" },
  { id: "MSI", label: "MSI" },
  { id: "pharmacode", label: "pharmacode" },
];

export const DEFAULT_BAR_CODE_CONTENT = "123456789012";

export const DEFAULT_BAR_CODE_OPTIONS: PDFEditorBarCodeOptions = {
  format: "CODE128",
  width: 2,
  height: 80,
  displayValue: true,
  background: "#FFFFFF",
  lineColor: "#000000",
  border: false,
  shadow: false,
  angle: 0,
};

export const mapToJsBarcodeOptions = (
  options?: PDFEditorBarCodeOptions
): Record<string, unknown> => ({
  format: options?.format ?? DEFAULT_BAR_CODE_OPTIONS.format,
  width: options?.width ?? DEFAULT_BAR_CODE_OPTIONS.width,
  height: options?.height ?? DEFAULT_BAR_CODE_OPTIONS.height,
  displayValue: options?.displayValue ?? DEFAULT_BAR_CODE_OPTIONS.displayValue,
  background: options?.background ?? DEFAULT_BAR_CODE_OPTIONS.background,
  lineColor: options?.lineColor ?? DEFAULT_BAR_CODE_OPTIONS.lineColor,
  margin: 8,
});

export const parseBarCodeState = (
  object: {
    codeContent?: string;
    codeOption?: unknown;
    strokeWidth?: number;
    shadow?: unknown;
  } | null
): EditorBarCodeState => {
  const codeOption =
    (object?.codeOption as Record<string, unknown> | undefined) ?? {};

  return {
    content: typeof object?.codeContent === "string" ? object.codeContent : "",
    format:
      typeof codeOption.format === "string"
        ? (codeOption.format as EditorBarCodeState["format"])
        : "CODE128",
    barWidth: typeof codeOption.width === "number" ? codeOption.width : 2,
    height: typeof codeOption.height === "number" ? codeOption.height : 80,
    displayValue: codeOption.displayValue !== false,
    background:
      typeof codeOption.background === "string"
        ? codeOption.background
        : "#FFFFFF",
    lineColor:
      typeof codeOption.lineColor === "string"
        ? codeOption.lineColor
        : "#000000",
    border: Boolean(object?.strokeWidth && object.strokeWidth > 0),
    shadow: Boolean(object?.shadow),
  };
};

/** Renders a barcode to a PNG data URL via jsbarcode. */
export const buildBarCodeDataUrl = (state: EditorBarCodeState): string => {
  const canvas = document.createElement("canvas");
  const content = state.content.trim() || DEFAULT_BAR_CODE_CONTENT;

  JsBarcode(canvas, content, {
    format: state.format,
    width: state.barWidth,
    height: state.height,
    displayValue: state.displayValue,
    background: state.background,
    lineColor: state.lineColor,
    margin: 8,
  });

  return canvas.toDataURL("image/png");
};
