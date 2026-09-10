import type jsPDF from "jspdf";
import type { jsPDFOptions } from "jspdf";

export type PdfOrientation = NonNullable<jsPDFOptions["orientation"]>;

export const getPdfOrientationForImage = (
  imageWidth: number,
  imageHeight: number,
  preferredOrientation?: PdfOrientation
): PdfOrientation => {
  if (preferredOrientation) return preferredOrientation;

  return imageWidth > imageHeight ? "landscape" : "portrait";
};

export const getImagePlacement = (
  pdfInstance: jsPDF,
  imageWidth: number,
  imageHeight: number,
  margin = 10
): {
  readonly x: number;
  readonly y: number;
  readonly renderWidth: number;
  readonly renderHeight: number;
} => {
  const pageWidth = pdfInstance.internal.pageSize.getWidth();
  const pageHeight = pdfInstance.internal.pageSize.getHeight();

  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2;

  const widthRatio = maxWidth / imageWidth;
  const heightRatio = maxHeight / imageHeight;
  const ratio = Math.min(widthRatio, heightRatio, 1);

  const renderWidth = imageWidth * ratio;
  const renderHeight = imageHeight * ratio;
  const x = (pageWidth - renderWidth) / 2;
  const y = (pageHeight - renderHeight) / 2;

  return { x, y, renderWidth, renderHeight };
};
