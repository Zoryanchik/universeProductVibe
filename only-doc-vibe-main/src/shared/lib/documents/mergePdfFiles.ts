import type { PDFDocument, PDFPage } from "pdf-lib";

import { internalFileTypeToMimeType } from "../../constants/file-type-mime-type-mappers";
import { InternalFileType } from "../../constants/file-type";
import { loadPdfLib } from "../lazy-load/loadPdfLib";

async function mergePdfArrayBuffers(
  pdfBuffers: ArrayBuffer[]
): Promise<ArrayBuffer> {
  const { PDFDocument } = await loadPdfLib();
  const mergedPdf: PDFDocument = await PDFDocument.create();

  const copiedPagesByDoc: PDFPage[][] = await Promise.all(
    pdfBuffers.map(async (buffer) => {
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });

      return mergedPdf.copyPages(pdf, pdf.getPageIndices());
    })
  );

  copiedPagesByDoc.forEach((pages) => {
    pages.forEach((page) => mergedPdf.addPage(page));
  });

  const merged = await mergedPdf.save();

  return merged.buffer as ArrayBuffer;
}

export async function mergePdfFiles(
  files: File[],
  outputFilename: string
): Promise<File> {
  const buffers = await Promise.all(files.map((file) => file.arrayBuffer()));
  const merged = await mergePdfArrayBuffers(buffers);

  return new File([merged], outputFilename, {
    type: internalFileTypeToMimeType(InternalFileType.PDF),
  });
}
