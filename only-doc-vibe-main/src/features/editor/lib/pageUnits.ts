import type { EditorPageSettings } from "../model/types";

/**
 * Matches pdf-editor SDK `px2mm` / `mm2px` in `src/utils/image.ts` (300 DPI basis).
 * Screen CSS px (96 DPI) is not used for page dimension display.
 */
export const EDITOR_PAGE_MM_DPI = 300;
const MM_PER_INCH = 25.4;

const pxPerMm = (): number => EDITOR_PAGE_MM_DPI / MM_PER_INCH;

export const pagePxToUnit = (
  value: number,
  unit: EditorPageSettings["unit"]
): number => {
  if (unit === "mm") {
    return Math.round(((value * MM_PER_INCH) / EDITOR_PAGE_MM_DPI) * 100) / 100;
  }

  if (unit === "in") {
    return Math.round((value / EDITOR_PAGE_MM_DPI) * 100) / 100;
  }

  return Math.round(value);
};

export const pageUnitToPx = (
  value: number,
  unit: EditorPageSettings["unit"]
): number => {
  if (unit === "mm") return Math.round(value * pxPerMm());

  if (unit === "in") return Math.round(value * EDITOR_PAGE_MM_DPI);

  return Math.round(value);
};

export const formatPageDimensionValue = (
  value: number,
  unit: EditorPageSettings["unit"]
): string => {
  if (unit === "mm" || unit === "in") {
    return Number.isFinite(value) ? value.toFixed(2) : "0";
  }

  return Number.isFinite(value) ? String(Math.round(value)) : "0";
};
