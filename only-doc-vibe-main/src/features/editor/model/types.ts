export interface PDFEditorExportOptions {
  quality?: number;
  dpi?: number;
  format?: "png" | "jpeg" | "pdf";
  pages?: "all" | "current" | number[];
}

export interface PDFEditorConfig {
  container: HTMLElement;
  width: number;
  height: number;
  wasmUrl: string;
  /**
   * 'continuous' stacks all pages in a native scroll column (each an interactive
   * canvas); 'single' is the legacy one-page-at-a-time canvas. Defaults to 'single'.
   */
  layout?: "single" | "continuous";
  onReady?: () => void;
  onError?: (error: Error) => void;
}

export interface PDFEditorTextOptions {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  underline?: boolean;
  linethrough?: boolean;
  textAlign?: "left" | "center" | "right" | "justify";
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  angle?: number;
  charSpacing?: number;
  lineHeight?: number;
  backgroundColor?: string;
  textStyle?: "transverse" | "direction";
  hollow?: boolean;
}

export interface PDFEditorImageOptions {
  left?: number;
  top?: number;
  scaleX?: number;
  scaleY?: number;
  opacity?: number;
  angle?: number;
}

export type EditorQRCodeStyle =
  | "A1"
  | "A2"
  | "A3"
  | "SP1"
  | "SP2"
  | "SP3"
  | "B1"
  | "C1"
  | "A_a1"
  | "A_a2"
  | "A_b1"
  | "A_b2";

export interface EditorQRCodeState {
  readonly content: string;
  readonly codeStyle: EditorQRCodeStyle;
  readonly margin: "none" | "standard";
  readonly errorCorrectionLevel: "L" | "M" | "Q" | "H";
  readonly border: boolean;
  readonly shadow: boolean;
}

export interface PDFEditorQRCodeOptions {
  size?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  foreground?: string;
  background?: string;
  margin?: number;
  border?: boolean;
  shadow?: boolean;
  angle?: number;
  codeStyle?: EditorQRCodeStyle;
}

export type EditorBarCodeFormat =
  | "CODE128"
  | "CODE39"
  | "EAN13"
  | "EAN8"
  | "UPC"
  | "ITF14"
  | "MSI"
  | "pharmacode";

export interface EditorBarCodeState {
  readonly content: string;
  readonly format: EditorBarCodeFormat;
  readonly barWidth: number;
  readonly height: number;
  readonly displayValue: boolean;
  readonly background: string;
  readonly lineColor: string;
  readonly border: boolean;
  readonly shadow: boolean;
}

export interface PDFEditorBarCodeOptions {
  format?: EditorBarCodeFormat;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  background?: string;
  lineColor?: string;
  border?: boolean;
  shadow?: boolean;
  angle?: number;
}

export type EditorStrokeLineJoin = "miter" | "round" | "bevel";

export interface EditorElementShadow {
  readonly color: string;
  readonly blur: number;
  readonly offsetX: number;
  readonly offsetY: number;
}

export interface EditorSelectedElement {
  readonly id: string | null;
  readonly type: string;
  readonly label: string;
  readonly isText: boolean;
  /** Fabric `ArcText` — text laid out along a curve. */
  readonly isArcText: boolean;
  readonly isImage: boolean;
  readonly isQRCode: boolean;
  readonly isBarCode: boolean;
  readonly isLocked: boolean;
  readonly qrCode?: EditorQRCodeState;
  readonly barCode?: EditorBarCodeState;
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly rotation: number;
  /** False for SDK material path/line shapes (move and scale only). */
  readonly supportsRotation: boolean;
  readonly opacity: number;
  readonly flipX: boolean;
  readonly flipY: boolean;
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth: number;
  readonly strokeEnabled: boolean;
  readonly strokeLineJoin: EditorStrokeLineJoin;
  readonly shadowEnabled: boolean;
  readonly shadow: EditorElementShadow;
  readonly fontFamily?: string;
  readonly fontSize?: number;
  readonly fontWeight?: string;
  readonly fontStyle?: string;
  readonly underline?: boolean;
  readonly linethrough?: boolean;
  readonly textAlign?: string;
  readonly lineHeight?: number;
  readonly charSpacing?: number;
  /** Fabric text highlight (`textBackgroundColor`). */
  readonly textBackgroundColor?: string;
  /** Arc curvature (ArcText only). Higher absolute value = tighter curve. */
  readonly curvature?: number;
}

export interface EditorPageSettings {
  readonly unit: "px" | "mm" | "in";
  readonly width: number;
  readonly height: number;
  readonly background: string;
}

export interface PDFEditorInstance {
  loadPDF: (url: string) => Promise<void>;
  exportToPDF: (options?: PDFEditorExportOptions) => Promise<Blob>;
  exportToPNG?: (options?: PDFEditorExportOptions) => Promise<Blob>;
  exportToJPEG?: (options?: PDFEditorExportOptions) => Promise<Blob>;
  destroy: () => void;
  getPageCount: () => number;
  getZoom?: () => number;
  setZoom?: (zoom: number) => void;
  fitToScreen?: () => void;
  goToPage?: (pageNumber: number) => void;
  /** Active rendering layout; 'continuous' when the scroll column is used. */
  getLayout?: () => "single" | "continuous";

  // Element creation
  addText?: (text?: string, options?: PDFEditorTextOptions) => void;
  addArcText?: (text?: string, options?: PDFEditorTextOptions) => void;
  addImage?: (url: string, options?: PDFEditorImageOptions) => void;
  addShape?: (path: string, options?: Record<string, unknown>) => void;
  addLine?: (options?: Record<string, unknown>) => void;
  addQRCode?: (content: string, options?: PDFEditorQRCodeOptions) => void;
  addBarCode?: (content: string, options?: PDFEditorBarCodeOptions) => void;
  addSignature?: (imageData: string) => void;
  addWatermark?: (text: string, options?: PDFEditorTextOptions) => void;

  // Element manipulation
  deleteSelected?: () => void;
  duplicateSelected?: () => void;
  selectAll?: () => void;
  clearSelection?: () => void;
  refreshSelectionControls?: () => void;
  lockWorkspaceObjects?: () => void;

  // Pages
  addPage?: () => void;
  deletePage?: (pageNumber: number) => void;

  // Canvas (fabric)
  getCanvas?: () => unknown;
  /** Live Fabric canvas for a specific page (1-based); continuous mode only. */
  getPageCanvas?: (pageNumber: number) => unknown;
  /**
   * Builds a detached, in-memory Fabric canvas for a page (1-based) from its
   * current template JSON, for side-effect-free rasterization during export.
   * The caller must dispose() the returned canvas. Returns null for pages that
   * are still streaming.
   */
  renderTemplateToCanvas?: (pageNumber: number) => Promise<unknown | null>;
}

declare global {
  interface Window {
    PDFEditorSDK?:
      | { default?: new (config: PDFEditorConfig) => PDFEditorInstance }
      | (new (config: PDFEditorConfig) => PDFEditorInstance);
  }
}
