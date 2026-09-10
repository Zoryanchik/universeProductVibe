export enum EFunnels {
  MAIN = "main_page",

  PDF_TO_WORD = "pdf_to_word",
  PDF_TO_PNG = "pdf_to_png",
  PDF_TO_JPG = "pdf_to_jpg",
  PDF_TO_EXCEL = "pdf_to_excel",
  PDF_TO_PPTX = "pdf_to_pptx",
  PDF_TO_TIFF = "pdf_to_tiff",
  PDF_TO_AZW3 = "pdf_to_azw3",

  WORD_TO_PDF = "word_to_pdf",
  PNG_TO_PDF = "png_to_pdf",
  JPG_TO_PDF = "jpg_to_pdf",
  EXCEL_TO_PDF = "excel_to_pdf",
  PPTX_TO_PDF = "pptx_to_pdf",
  TIFF_TO_PDF = "tiff_to_pdf",
  AZW3_TO_PDF = "azw3_to_pdf",
  SVG_TO_PDF = "svg_to_pdf",

  COMPRESS_PDF = "compress_pdf",

  PDF_OCR = "pdf_ocr",

  REMOVE_WATERMARK = "remove_watermark",
  UNLOCK_PDF = "unlock_pdf",
  ENHANCE_IMAGE = "enhance_image",
  TRANSLATE_PDF = "translate_pdf",
  PDF_SUMMARIZER = "pdf_summarizer",

  MERGE_PDF = "merge_pdf",
  SPLIT_PDF = "split_pdf",
  SIGN_PDF = "sign_pdf",
  EDIT_PDF = "edit_pdf",
  DELETE_PDF_PAGES = "delete_pdf_pages",
  ROTATE_PDF = "rotate_pdf",
  PDF_READER = "pdf_reader",
}

export const EFunnelsSSE = [
  EFunnels.PDF_TO_WORD,
  EFunnels.PDF_TO_PNG,
  EFunnels.PDF_TO_JPG,
  EFunnels.PDF_TO_EXCEL,
  EFunnels.PDF_TO_PPTX,
  EFunnels.WORD_TO_PDF,
  EFunnels.EXCEL_TO_PDF,
  EFunnels.PPTX_TO_PDF,
  EFunnels.COMPRESS_PDF,
  EFunnels.PDF_OCR,
  EFunnels.UNLOCK_PDF,
  EFunnels.TRANSLATE_PDF,
  EFunnels.ENHANCE_IMAGE,
];

export const FUNNEL_VALUES = Object.values(EFunnels);

export function isFunnel(funnel: unknown): funnel is EFunnels {
  if (typeof funnel !== "string") return false;

  // Could be any form from SEO (they have very much forms)
  if (funnel.includes("form")) return true;

  return FUNNEL_VALUES.includes(funnel as EFunnels);
}
