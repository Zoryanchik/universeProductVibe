import { loadPdfJsLib } from "../lazy-load/loadPdfJsLib";

interface IPayload {
  /**
   * @description If provided then it will download and open file by default
   * @url "anyurl.com/*.pdf"
   */
  pdfFileUrl?: string;

  /**
   * @description If provided then it will open file by default.
   * @url fetch("anyurl.com/*.pdf").then((response) => response.arrayBuffer())
   */
  pdfFileArrayBuffer?: ArrayBuffer;

  /**
   * @description Page index to get cover. Starts at 0.
   * @default 0.
   */
  pageIndex?: number;

  /**
   * @description Required width in pixels to render.
   */
  width: number;

  /**
   * @description If true, then error will be thrown.
   * @default false.
   */
  throwError?: boolean;
}

/**
 * @description Generates thumbnail for provided index page in required width.
 * 1. Create enew instance of PdfViewer;
 * 2. Listen to classList changes of root node;
 * 3. Once state changed to 'rendered' grab thumbnail in required format;
 * 4. Return thumbnail;
 * 5. Cleanup rendering tree.
 * @returns Image in Blob format.
 * @example const blob = await generatePDFCover({
 *   pdfFileUrl: '/FoxitPDFSDKforWeb_DemoGuide.pdf',
 *   width: 1920
 * })
 */
export async function generatePDFCover({
  pdfFileUrl,
  pdfFileArrayBuffer,
  width,
  pageIndex = 0,
  throwError = false,
}: IPayload): Promise<Blob | null> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<Blob | null>(async (resolve, reject) => {
    try {
      const doc = await (async () => {
        const pdfjs = await loadPdfJsLib();
        if (pdfFileUrl != null) {
          return pdfjs.getDocument(pdfFileUrl).promise;
        }

        if (pdfFileArrayBuffer != null) {
          return pdfjs.getDocument(pdfFileArrayBuffer).promise;
        }

        throw new Error("pdfFileUrl or pdfFileArrayBuffer are required");
      })();

      const coverPage = await doc.getPage(pageIndex + 1);
      const [_1, _2, viewportWidth, viewportHeight] =
        coverPage.getViewport().viewBox;

      // Determine if the page is in album format (width > height)
      const isAlbumFormat =
        coverPage.getViewport().rotation === 90 ||
        coverPage.getViewport().rotation === 270;

      // Calculate dimensions maintaining aspect ratio
      let canvasWidth = width;
      let canvasHeight = (width / viewportWidth) * viewportHeight;

      // If in album format, swap dimensions to fit width
      if (isAlbumFormat) {
        canvasWidth = width;
        canvasHeight = (width / viewportHeight) * viewportWidth;
      }

      const canvas = document?.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      const scaledViewport = coverPage.getViewport({
        scale: Math.min(
          canvas.width / viewportWidth,
          canvas.width / viewportWidth
        ),
      });

      await coverPage.render({
        canvas,
        canvasContext: canvas.getContext("2d")!,
        viewport: scaledViewport,
      }).promise;

      canvas.toBlob((blob) => {
        resolve(blob);
        canvas.remove();
      });
    } catch (err) {
      if (throwError) {
        reject(err);
      }

      resolve(null);
    }
  });
}
