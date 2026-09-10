/* eslint-disable-next-line @typescript-eslint/consistent-type-imports */
type PdfJsLib = typeof import("pdfjs-dist");

// Vite ?url import ensures the worker is treated as an asset with correct
// (hashed in prod) URL. This avoids brittle public/ copies and works reliably
// in dev and build even with base paths or client-side routing.
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

let pdfjs: PdfJsLib | null = null;

export async function loadPdfJsLib(): Promise<PdfJsLib> {
  if (pdfjs) return pdfjs;

  pdfjs = await import("pdfjs-dist");

  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

  return pdfjs;
}
