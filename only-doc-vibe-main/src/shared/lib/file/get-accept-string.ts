import { InternalFileType } from "../../constants/file-type";

const FILE_TYPE_TO_MIME_TYPE: Record<InternalFileType, string> = {
  [InternalFileType.PDF]: "application/pdf",
  [InternalFileType.DOC]: "application/msword",
  [InternalFileType.DOCX]:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  [InternalFileType.XLS]: "application/vnd.ms-excel",
  [InternalFileType.XLSX]:
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  [InternalFileType.JPG]: "image/jpeg",
  [InternalFileType.JPEG]: "image/jpeg",
  [InternalFileType.PNG]: "image/png",
  [InternalFileType.PPT]: "application/vnd.ms-powerpoint",
  [InternalFileType.PPTX]:
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  [InternalFileType.GIF]: "image/gif",
  [InternalFileType.BMP]: "image/bmp",
  [InternalFileType.WEBP]: "image/webp",
  [InternalFileType.HEIC]: "image/heic",
  [InternalFileType.HEIF]: "image/heif",
  [InternalFileType.SVG]: "image/svg+xml",
  [InternalFileType.TIFF]: "image/tiff",
  [InternalFileType.TIF]: "image/tiff",
  [InternalFileType.RTF]: "application/rtf",
  [InternalFileType.TXT]: "text/plain",
  [InternalFileType.TEXT]: "text/plain",
  [InternalFileType.CSV]: "text/csv",
  [InternalFileType.HTML]: "text/html",
  [InternalFileType.HTM]: "text/html",
  [InternalFileType.XML]: "text/xml",
  [InternalFileType.JSON]: "application/json",
  [InternalFileType.ZIP]: "application/zip",
} as Record<InternalFileType, string>;

export const getAcceptString = (formats: InternalFileType[]): string => {
  return formats
    .map((format) => {
      const mimeType = FILE_TYPE_TO_MIME_TYPE[format];
      const extension = `.${format.toLowerCase()}`;

      return mimeType ? `${mimeType},${extension}` : extension;
    })
    .join(",");
};
