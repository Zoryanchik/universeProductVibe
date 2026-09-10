export enum EOcrExportFormat {
  TXT = "txt",
  TXT_UNSTRUCTURED = "txtUnstructured",
  RTF = "rtf",
  DOCX = "docx",
  XLSX = "xlsx",
  PPTX = "pptx",
  PDF_SEARCHABLE = "pdfSearchable",
  PDF_TEXT_AND_IMAGES = "pdfTextAndImages",
  PDF_A = "pdfa",
}

export type SupportedOcrExportFormat =
  | EOcrExportFormat.TXT
  | EOcrExportFormat.PDF_SEARCHABLE
  | EOcrExportFormat.DOCX;

export interface IOcrExportFormatItem {
  to: SupportedOcrExportFormat;
  converterName: string;
  icon: string;
}
