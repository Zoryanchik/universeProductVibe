export enum EFlow {
  CONVERTER = "CONVERTER",
  COMPRESS = "COMPRESS",
  TRANSLATE = "TRANSLATE",
  OCR = "OCR",
  REMOVE_WATERMARK = "REMOVE_WATERMARK",
  ENHANCE_IMAGE = "ENHANCE_IMAGE",
  PDF_SUMMARIZER = "PDF_SUMMARIZER",
  PDF_TO_TIFF = "PDF_TO_TIFF",
  TIFF_TO_PDF = "TIFF_TO_PDF",
  AZW3_TO_PDF = "AZW3_TO_PDF",
  PDF_TO_AZW3 = "PDF_TO_AZW3",
  SVG_TO_PDF = "SVG_TO_PDF",
}

const FLOW_VALUES = Object.values(EFlow);

export const isFlow = (value: unknown): value is EFlow => {
  return FLOW_VALUES.includes(value as EFlow);
};
