import { loadPdfLib } from "../lazy-load/loadPdfLib";

const COUNT_PDF_PAGES_TIMEOUT_MS = 30_000;

export class CountPdfPagesTimeoutError extends Error {
  constructor() {
    super("countPdfPages timed out");
    this.name = "CountPdfPagesTimeoutError";
  }
}

/**
 * Counts the pages of a PDF file in the browser.
 *
 * Resolves to `0` only for a successfully-read PDF that pdf-lib can't parse
 * the page count of (e.g. some encrypted/malformed PDFs) — that's a real,
 * documented outcome and a number of callers rely on it as a signal.
 *
 * Rejects (rather than silently resolving 0) when:
 *  - the FileReader emits an error,
 *  - `loadPdfLib()` fails to load the dynamic chunk,
 *  - the synchronous setup throws,
 *  - we hit the 30s safety timeout (the original implementation could hang
 *    indefinitely on an unhandled `loadPdfLib` rejection inside `onload`).
 *
 * Callers that want a non-throwing best-effort count (e.g. AI summarizer's
 * page-limit pre-check) should wrap this in a try/catch and fall back to a
 * sentinel themselves.
 */
export const countPdfPages = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (work: () => void) => {
      if (settled) return;

      settled = true;
      window.clearTimeout(timeoutId);
      work();
    };

    const timeoutId = window.setTimeout(() => {
      finish(() => reject(new CountPdfPagesTimeoutError()));
    }, COUNT_PDF_PAGES_TIMEOUT_MS);

    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        let PDFDocument: Awaited<ReturnType<typeof loadPdfLib>>["PDFDocument"];
        try {
          ({ PDFDocument } = await loadPdfLib());
        } catch (error) {
          // pdf-lib chunk load failure is infrastructure, not a "bad PDF" —
          // reject so callers can distinguish it from a malformed file.
          finish(() =>
            reject(error instanceof Error ? error : new Error(String(error)))
          );

          return;
        }

        try {
          const pdfDoc = await PDFDocument.load(
            e.target?.result as ArrayBuffer,
            { ignoreEncryption: true }
          );
          finish(() => resolve(pdfDoc.getPageCount()));
        } catch {
          // Malformed / unsupported PDF — keep the long-standing "0 pages"
          // semantics so existing callers can rely on it as a signal.
          finish(() => resolve(0));
        }
      };

      reader.onerror = () =>
        finish(() => reject(reader.error ?? new Error("FileReader error")));
      reader.readAsArrayBuffer(file);
    } catch (error) {
      finish(() =>
        reject(error instanceof Error ? error : new Error(String(error)))
      );
    }
  });
};
