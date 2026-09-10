import { TOOL_CARDS } from "@/shared/constants/service-tabs";

export enum EToolCategory {
  PDF = "PDF",
  IMAGE = "IMAGE",
  AI = "AI",
}

export interface IDashboardTool {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly url: string;
  readonly category: EToolCategory;
}

type DashboardTranslate = (key: string) => string | Record<string, unknown>;

export const TOOL_DESCRIPTION_KEYS: Record<string, string> = {
  "translate-pdf": "dashboard.toolDescriptions.translatePdf",
  "compress-pdf": "dashboard.toolDescriptions.compressPdf",
  "pdf-ocr": "dashboard.toolDescriptions.pdfOcr",
  "pdf-to-word": "dashboard.toolDescriptions.pdfToWord",
  "pdf-to-excel": "dashboard.toolDescriptions.pdfToExcel",
  "pdf-to-azw3": "dashboard.toolDescriptions.pdfToAzw3",
  "word-to-pdf": "dashboard.toolDescriptions.wordToPdf",
  "excel-to-pdf": "dashboard.toolDescriptions.excelToPdf",
  "azw3-to-pdf": "dashboard.toolDescriptions.azw3ToPdf",
  "remove-watermark": "dashboard.toolDescriptions.removeWatermark",
  "pdf-to-jpg": "dashboard.toolDescriptions.pdfToJpg",
  "pdf-to-png": "dashboard.toolDescriptions.pdfToPng",
  "pdf-to-tiff": "dashboard.toolDescriptions.pdfToTiff",
  "jpg-to-pdf": "dashboard.toolDescriptions.jpgToPdf",
  "png-to-pdf": "dashboard.toolDescriptions.pngToPdf",
  "tiff-to-pdf": "dashboard.toolDescriptions.tiffToPdf",
  "svg-to-pdf": "dashboard.toolDescriptions.svgToPdf",
  "enhance-image": "dashboard.toolDescriptions.enhanceImage",
  "pdf-summarizer": "dashboard.toolDescriptions.pdfSummarizer",
};

/**
 * Tool ids hidden from the dashboard until their backend ships
 * (per product spec: merge, edit-pdf, audio/video, watermark/sign).
 */
export const HIDDEN_TOOL_IDS = new Set<string>([
  "merge-pdf",
  "edit-pdf",
  "audio-to-pdf",
  "video-to-pdf",
  "watermark",
  "sign-pdf",
]);

const PDF_TOOL_IDS = new Set<string>([
  "compress-pdf",
  "pdf-ocr",
  "pdf-to-word",
  "pdf-to-excel",
  "pdf-to-azw3",
  "word-to-pdf",
  "excel-to-pdf",
  "azw3-to-pdf",
  "remove-watermark",
]);

const IMAGE_TOOL_IDS = new Set<string>([
  "pdf-to-jpg",
  "pdf-to-png",
  "pdf-to-tiff",
  "jpg-to-pdf",
  "png-to-pdf",
  "tiff-to-pdf",
  "svg-to-pdf",
  "enhance-image",
]);

const AI_TOOL_IDS = new Set<string>(["translate-pdf", "pdf-summarizer"]);

export const categorize = (id: string): EToolCategory | null => {
  if (PDF_TOOL_IDS.has(id)) return EToolCategory.PDF;

  if (IMAGE_TOOL_IDS.has(id)) return EToolCategory.IMAGE;

  if (AI_TOOL_IDS.has(id)) return EToolCategory.AI;

  return null;
};

/**
 * Categorizes a CMS-sourced tool, always returning a category so that no tool
 * is dropped from the dashboard (mirrors pdf-fly's locale-tools fix). Falls
 * back to the CMS `category_id` and a slug heuristic when the canonical slug is
 * not in the hardcoded sets.
 */
export const categorizeCmsTool = (
  canonicalSlug: string,
  fallbackCategory = ""
): EToolCategory => {
  const category = categorize(canonicalSlug);
  if (category) return category;

  if (
    /\b(image|jpg|jpeg|png|tiff|svg|heic|webp)\b/.test(canonicalSlug) ||
    fallbackCategory === "image-tools"
  ) {
    return EToolCategory.IMAGE;
  }

  if (
    /\b(ai|summarizer|translate)\b/.test(canonicalSlug) ||
    fallbackCategory === "ai-tools"
  ) {
    return EToolCategory.AI;
  }

  return EToolCategory.PDF;
};

export const getToolDescription = (
  id: string,
  t?: DashboardTranslate
): string => {
  const key = TOOL_DESCRIPTION_KEYS[id];
  if (!key || !t) return "";

  return String(t(key));
};

export const buildDashboardTools = (t?: DashboardTranslate): IDashboardTool[] =>
  TOOL_CARDS.flatMap((tool) => {
    if (HIDDEN_TOOL_IDS.has(tool.id)) return [];

    const category = categorize(tool.id);
    if (!category) return [];

    return [
      {
        id: tool.id,
        title: tool.title,
        description: getToolDescription(tool.id, t),
        icon: tool.icon,
        url: tool.url,
        category,
      },
    ];
  });

export const DASHBOARD_TOOLS: IDashboardTool[] = buildDashboardTools();

export const DASHBOARD_TOOL_CATEGORIES: EToolCategory[] = [
  EToolCategory.PDF,
  EToolCategory.IMAGE,
  EToolCategory.AI,
];
