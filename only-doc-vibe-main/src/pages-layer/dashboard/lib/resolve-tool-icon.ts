/**
 * Resolves a tool icon URL from either a CMS absolute URL or a local tool id.
 *
 * Priority:
 *  1. If `cmsUrl` is a non-empty absolute URL (http/https) — use it directly.
 *  2. If a `toolId` is provided — return the known local asset path.
 *  3. Otherwise fall back to the generic tool icon.
 */

const LOCAL_TOOL_ICON_BASE = "/assets/icons/tools";

const TOOL_ICON_MAP: Record<string, string> = {
  "translate-pdf": `${LOCAL_TOOL_ICON_BASE}/tool-icon-translate.svg`,
  "compress-pdf": `${LOCAL_TOOL_ICON_BASE}/tool-icon-compress.svg`,
  "pdf-ocr": `${LOCAL_TOOL_ICON_BASE}/tool-icon-ocr.svg`,
  "remove-watermark": `${LOCAL_TOOL_ICON_BASE}/tool-icon-remove-watermark.svg`,
  "pdf-to-word": `${LOCAL_TOOL_ICON_BASE}/tool-icon-pdf-to-word.svg`,
  "pdf-to-excel": `${LOCAL_TOOL_ICON_BASE}/tool-icon-pdf-to-excel.svg`,
  "pdf-to-jpg": `${LOCAL_TOOL_ICON_BASE}/tool-icon-pdf-to-jpg.svg`,
  "pdf-to-png": `${LOCAL_TOOL_ICON_BASE}/tool-icon-pdf-to-png.svg`,
  "pdf-to-azw3": `${LOCAL_TOOL_ICON_BASE}/tool-icon-from-pdf.svg`,
  "word-to-pdf": `${LOCAL_TOOL_ICON_BASE}/tool-icon-word-to-pdf.svg`,
  "excel-to-pdf": `${LOCAL_TOOL_ICON_BASE}/tool-icon-excel-to-pdf.svg`,
  "jpg-to-pdf": `${LOCAL_TOOL_ICON_BASE}/tool-icon-jpg-to-pdf.svg`,
  "png-to-pdf": `${LOCAL_TOOL_ICON_BASE}/tool-icon-png-to-pdf.svg`,
  "svg-to-pdf": `${LOCAL_TOOL_ICON_BASE}/tool-icon-to-pdf.svg`,
  "azw3-to-pdf": `${LOCAL_TOOL_ICON_BASE}/tool-icon-to-pdf.svg`,
  "enhance-image": `${LOCAL_TOOL_ICON_BASE}/tool-icon-enhance-image.svg`,
  "pdf-summarizer": `${LOCAL_TOOL_ICON_BASE}/tool-icon-ai-summarizer.svg`,
};

const FALLBACK_ICON = `${LOCAL_TOOL_ICON_BASE}/tool-icon-to-pdf.svg`;

const isAbsoluteUrl = (url: string): boolean =>
  url.startsWith("http://") || url.startsWith("https://");

export const resolveToolIcon = (
  cmsUrl: string | undefined | null,
  toolId?: string
): string => {
  if (cmsUrl && isAbsoluteUrl(cmsUrl)) return cmsUrl;

  if (toolId && TOOL_ICON_MAP[toolId]) return TOOL_ICON_MAP[toolId];

  return FALLBACK_ICON;
};
