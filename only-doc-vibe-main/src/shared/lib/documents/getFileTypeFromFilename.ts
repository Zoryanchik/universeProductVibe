import { isInternalFileType } from "../../constants/file-type";
import type { InternalFileType } from "../../constants/file-type";

export const getFIleTypeFromFilename = (
  fileName: string
): InternalFileType | null => {
  const extension = fileName.split(".").pop()?.toUpperCase();

  if (!isInternalFileType(extension)) return null;

  return extension as InternalFileType;
};
