import { InternalFileType, isImageFileType } from "../../constants/file-type";

export const isImageToPdfConvertFunnel = (
  formatTo: InternalFileType | undefined,
  acceptedFormats: readonly InternalFileType[]
): boolean =>
  formatTo === InternalFileType.PDF &&
  acceptedFormats.length > 0 &&
  acceptedFormats.every(isImageFileType);
