import { EMimeType } from "../../constants/mime-type";
import { loadHeicTo } from "../lazy-load/loadHeicTo";
import { blobToFile } from "./blobToFile";
import { getFileNameWithoutFormat } from "./getFilenameWithoutFormat";

export async function convertHeicToJpeg(
  file: File,
  { quality = 0.5 }: { quality?: number } = {}
): Promise<File> {
  const heicTo = await loadHeicTo();
  try {
    const blob = await heicTo({
      blob: file,
      type: EMimeType.JPEG,
      quality,
    });

    return blobToFile(blob, `${getFileNameWithoutFormat(file.name)}.jpeg`);
  } catch (error) {
    throw new Error(`Failed to convert HEIC: ${(error as Error).message}`);
  }
}
