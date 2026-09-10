import { loadFranc } from "../lazy-load/loadFranc";
import { loadPdfJsLib } from "../lazy-load/loadPdfJsLib";

export const detectPdfLanguage = async (base64: string) => {
  try {
    const [pdfjs, { franc }] = await Promise.all([loadPdfJsLib(), loadFranc()]);
    const pdfBytes = atob(base64.split(",")[1]);
    const byteArray = new Uint8Array(pdfBytes.length);
    for (let i = 0; i < pdfBytes.length; i++) {
      byteArray[i] = pdfBytes.charCodeAt(i);
    }

    const pdf = await pdfjs.getDocument(byteArray).promise;
    const maxPages = Math.min(5, pdf.numPages);
    let fullText = "";

    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      fullText += pageText + " ";
    }

    return franc(fullText);
  } catch (error) {
    console.error("Error extracting text from PDF:", error);

    return null;
  }
};
