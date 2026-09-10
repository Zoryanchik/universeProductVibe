import { convertImageToPdf } from "./convertImageToPdf";
import { getFileNameWithoutFormat } from "./getFilenameWithoutFormat";
import { getOrientationFromFile } from "./getOrientationFromFile";
import { mergePdfFiles } from "./mergePdfFiles";

const DEFAULT_MERGED_FILENAME = "merged.pdf";

export async function convertImagesToMergedPdf(files: File[]): Promise<File> {
  if (files.length === 0) {
    throw new Error("convertImagesToMergedPdf: no files provided");
  }

  if (files.length === 1) {
    return convertImageToPdf(files[0]);
  }

  const orientation = await getOrientationFromFile(files[0]);

  const singlePagePdfs = await Promise.all(
    files.map((file) => convertImageToPdf(file, { orientation }))
  );

  const baseName = getFileNameWithoutFormat(files[0].name);
  const outputFilename = baseName ? `${baseName}.pdf` : DEFAULT_MERGED_FILENAME;

  return mergePdfFiles(singlePagePdfs, outputFilename);
}
