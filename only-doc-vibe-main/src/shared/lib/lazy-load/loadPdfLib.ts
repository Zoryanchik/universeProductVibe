// eslint-disable-next-line
type PdfLib = typeof import("pdf-lib");

let pdfLib: PdfLib | null = null;

export const loadPdfLib = async (): Promise<PdfLib> => {
  if (pdfLib) return pdfLib;

  pdfLib = await import("pdf-lib");

  return pdfLib;
};
