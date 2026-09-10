export enum EServiceTabId {
  EDIT_PDF = "edit-pdf",
  CONVERT_FROM_PDF = "convert-from-pdf",
  CONVERT_TO_PDF = "convert-to-pdf",
  IMAGE_TOOLS = "image-tools",
  AI_TOOLS = "ai-tools",
}

export interface IToolCard {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly ctaButton?: string;
  readonly icon: string;
  readonly category: EServiceTabId;
  readonly url: string;
}

export const TOOL_CARDS: readonly IToolCard[] = [
  {
    id: "translate-pdf",
    title: "Translate PDF",
    icon: "/assets/icons/tools/tool-icon-translate.svg",
    category: EServiceTabId.EDIT_PDF,
    url: "/translate-pdf",
  },
  {
    id: "compress-pdf",
    title: "Compress PDF",
    icon: "/assets/icons/tools/tool-icon-compress.svg",
    category: EServiceTabId.EDIT_PDF,
    url: "/compress-pdf",
  },
  {
    id: "pdf-ocr",
    title: "PDF OCR",
    icon: "/assets/icons/tools/tool-icon-ocr.svg",
    category: EServiceTabId.EDIT_PDF,
    url: "/pdf-ocr",
  },
  {
    id: "remove-watermark",
    title: "Remove Watermark",
    icon: "/assets/icons/tools/tool-icon-remove-watermark.svg",
    category: EServiceTabId.EDIT_PDF,
    url: "/remove-watermark",
  },
  {
    id: "pdf-to-word",
    title: "PDF to WORD",
    icon: "/assets/icons/tools/tool-icon-pdf-to-word.svg",
    category: EServiceTabId.CONVERT_FROM_PDF,
    url: "/pdf-to-word",
  },
  {
    id: "pdf-to-excel",
    title: "PDF to EXCEL",
    icon: "/assets/icons/tools/tool-icon-pdf-to-excel.svg",
    category: EServiceTabId.CONVERT_FROM_PDF,
    url: "/pdf-to-excel",
  },
  {
    id: "pdf-to-jpg",
    title: "PDF to JPG",
    icon: "/assets/icons/tools/tool-icon-pdf-to-jpg.svg",
    category: EServiceTabId.CONVERT_FROM_PDF,
    url: "/pdf-to-jpg",
  },
  {
    id: "pdf-to-png",
    title: "PDF to PNG",
    icon: "/assets/icons/tools/tool-icon-pdf-to-png.svg",
    category: EServiceTabId.CONVERT_FROM_PDF,
    url: "/pdf-to-png",
  },
  {
    id: "pdf-to-tiff",
    title: "PDF to TIFF",
    icon: "/assets/icons/tools/tool-icon-from-pdf.svg",
    category: EServiceTabId.CONVERT_FROM_PDF,
    url: "/pdf-to-tiff",
  },
  {
    id: "pdf-to-azw3",
    title: "PDF to AZW3",
    icon: "/assets/icons/tools/tool-icon-from-pdf.svg",
    category: EServiceTabId.CONVERT_FROM_PDF,
    url: "/pdf-to-azw3",
  },
  {
    id: "word-to-pdf",
    title: "WORD to PDF",
    icon: "/assets/icons/tools/tool-icon-word-to-pdf.svg",
    category: EServiceTabId.CONVERT_TO_PDF,
    url: "/word-to-pdf",
  },
  {
    id: "excel-to-pdf",
    title: "EXCEL to PDF",
    icon: "/assets/icons/tools/tool-icon-excel-to-pdf.svg",
    category: EServiceTabId.CONVERT_TO_PDF,
    url: "/excel-to-pdf",
  },
  {
    id: "jpg-to-pdf",
    title: "JPG to PDF",
    icon: "/assets/icons/tools/tool-icon-jpg-to-pdf.svg",
    category: EServiceTabId.CONVERT_TO_PDF,
    url: "/jpg-to-pdf",
  },
  {
    id: "png-to-pdf",
    title: "PNG to PDF",
    icon: "/assets/icons/tools/tool-icon-png-to-pdf.svg",
    category: EServiceTabId.CONVERT_TO_PDF,
    url: "/png-to-pdf",
  },
  {
    id: "tiff-to-pdf",
    title: "TIFF to PDF",
    icon: "/assets/icons/tools/tool-icon-to-pdf.svg",
    category: EServiceTabId.CONVERT_TO_PDF,
    url: "/tiff-to-pdf",
  },
  {
    id: "azw3-to-pdf",
    title: "AZW3 to PDF",
    icon: "/assets/icons/tools/tool-icon-to-pdf.svg",
    category: EServiceTabId.CONVERT_TO_PDF,
    url: "/azw3-to-pdf",
  },
  {
    id: "svg-to-pdf",
    title: "SVG to PDF",
    icon: "/assets/icons/tools/tool-icon-to-pdf.svg",
    category: EServiceTabId.CONVERT_TO_PDF,
    url: "/svg-to-pdf",
  },
  {
    id: "enhance-image",
    title: "Enhance Image",
    icon: "/assets/icons/tools/tool-icon-enhance-image.svg",
    category: EServiceTabId.IMAGE_TOOLS,
    url: "/enhance-image",
  },
  {
    id: "pdf-summarizer",
    title: "PDF Summarizer",
    icon: "/assets/icons/tools/tool-icon-ai-summarizer.svg",
    category: EServiceTabId.AI_TOOLS,
    url: "/pdf-summarizer",
  },
] as const;
