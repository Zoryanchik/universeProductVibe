import { loadPdfJsLib } from "@/shared/lib/lazy-load/loadPdfJsLib";

import type { EditorPageThumbnail } from "../model/sdkBindings";

interface GeneratePdfThumbnailsOptions {
  /** Target thumbnail width in CSS pixels (height keeps the page aspect ratio). */
  readonly width?: number;
  /** Called as each page finishes so the sidebar can fill previews progressively. */
  readonly onPage?: (thumbnail: EditorPageThumbnail) => void;
  /** Return true to abort remaining pages (e.g. a new document was loaded). */
  readonly isCancelled?: () => boolean;
}

const DEFAULT_THUMBNAIL_WIDTH = 240;

/**
 * Converts a base64 data URL into bytes so pdfjs receives binary data (it cannot
 * fetch `data:` URLs reliably across browsers). Non-data sources are passed as URLs.
 */
const toPdfjsSource = (
  source: string
): { data: Uint8Array } | { url: string } => {
  if (!source.startsWith("data:")) return { url: source };

  const base64 = source.slice(source.indexOf(",") + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return { data: bytes };
};

/**
 * Renders every page of the PDF to a small thumbnail using pdfjs, entirely
 * offscreen. This is independent of the editor's Fabric canvas, so it never
 * hides or flips the visible page while previews are generated.
 *
 * Best-effort: a failed page is skipped, and the whole run resolves to whatever
 * was produced (callers keep placeholder thumbnails for missing pages).
 */
export const generatePdfThumbnails = async (
  source: string,
  {
    width = DEFAULT_THUMBNAIL_WIDTH,
    onPage,
    isCancelled,
  }: GeneratePdfThumbnailsOptions = {}
): Promise<EditorPageThumbnail[]> => {
  const thumbnails: EditorPageThumbnail[] = [];

  let doc: Awaited<
    ReturnType<
      Awaited<ReturnType<typeof loadPdfJsLib>>["getDocument"]
    >["promise"]
  > | null = null;

  try {
    const pdfjs = await loadPdfJsLib();
    doc = await pdfjs.getDocument(toPdfjsSource(source)).promise;

    const dpr =
      typeof window !== "undefined" && window.devicePixelRatio
        ? Math.min(window.devicePixelRatio, 2)
        : 1;

    for (let page = 1; page <= doc.numPages; page += 1) {
      if (isCancelled?.()) break;

      try {
        const pdfPage = await doc.getPage(page);
        const baseViewport = pdfPage.getViewport({ scale: 1 });
        const scale = (width / baseViewport.width) * dpr;
        const viewport = pdfPage.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(viewport.width));
        canvas.height = Math.max(1, Math.round(viewport.height));
        const context = canvas.getContext("2d");
        if (!context) {
          canvas.remove();
          continue;
        }

        await pdfPage.render({ canvas, canvasContext: context, viewport })
          .promise;

        const thumbnail: EditorPageThumbnail = {
          page,
          dataUrl: canvas.toDataURL("image/jpeg", 0.72),
        };
        thumbnails.push(thumbnail);
        onPage?.(thumbnail);

        pdfPage.cleanup();
        canvas.remove();
      } catch {
        // Skip pages that fail to render; the sidebar keeps their placeholder.
      }

      // Yield to the main thread so page streaming/interaction stays responsive.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } catch {
    // pdfjs could not open the source (e.g. CORS on a remote URL). Callers keep
    // placeholder thumbnails and fall back to on-navigation SDK captures.
  } finally {
    try {
      await doc?.destroy();
    } catch {
      // ignore cleanup failures
    }
  }

  return thumbnails;
};
