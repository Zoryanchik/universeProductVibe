import { InternalFileType } from "@/shared/constants/file-type";

export enum EDashboardTab {
  MY_FILES = "MY_FILES",
  TOOLS = "TOOLS",
}

/** Which dashboard surface is rendered: the main file/tools workspace or the account page. */
export type DashboardView = "main" | "account";

export enum EDashboardViewMode {
  LIST = "LIST",
  GRID = "GRID",
}

export enum EDashboardSort {
  DATE_DESC = "DATE_DESC",
  DATE_ASC = "DATE_ASC",
  SIZE_DESC = "SIZE_DESC",
  SIZE_ASC = "SIZE_ASC",
  NAME_ASC = "NAME_ASC",
  NAME_DESC = "NAME_DESC",
}

export enum EFormatGroup {
  ALL = "ALL",
  PDF = "PDF",
  IMAGE = "IMAGE",
  WORD = "WORD",
  SPREADSHEET = "SPREADSHEET",
  PRESENTATION = "PRESENTATION",
  EBOOK = "EBOOK",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
  TEXT = "TEXT",
  OTHER = "OTHER",
}

export const FORMAT_GROUPS: EFormatGroup[] = [
  EFormatGroup.ALL,
  EFormatGroup.PDF,
  EFormatGroup.IMAGE,
  EFormatGroup.WORD,
  EFormatGroup.SPREADSHEET,
  EFormatGroup.PRESENTATION,
  EFormatGroup.EBOOK,
  EFormatGroup.AUDIO,
  EFormatGroup.VIDEO,
  EFormatGroup.TEXT,
  EFormatGroup.OTHER,
];

const PDF_TYPES: string[] = [InternalFileType.PDF];

const IMAGE_TYPES: string[] = [
  InternalFileType.PNG,
  InternalFileType.JPG,
  InternalFileType.JPEG,
  InternalFileType.WEBP,
  InternalFileType.BMP,
  InternalFileType.GIF,
  InternalFileType.TIFF,
  InternalFileType.TIF,
  InternalFileType.HEIC,
  InternalFileType.HEIF,
  InternalFileType.SVG,
  InternalFileType.AVIF,
  InternalFileType.ICO,
  InternalFileType.JFIF,
  InternalFileType.DJVU,
  InternalFileType.DWG,
  InternalFileType.DXF,
  InternalFileType.EPS,
];

const WORD_TYPES: string[] = [
  InternalFileType.DOC,
  InternalFileType.DOCX,
  InternalFileType.ODT,
  InternalFileType.RTF,
  InternalFileType.ABW,
  InternalFileType.HWP,
];

const SPREADSHEET_TYPES: string[] = [
  InternalFileType.CSV,
  InternalFileType.ODS,
  InternalFileType.XLS,
  InternalFileType.XLSX,
];

const PRESENTATION_TYPES: string[] = [
  InternalFileType.ODP,
  InternalFileType.PPT,
  InternalFileType.PPTX,
];

const EBOOK_TYPES: string[] = [
  InternalFileType.EPUB,
  InternalFileType.MOBI,
  InternalFileType.AZW,
  InternalFileType.AZW3,
  InternalFileType.CBR,
];

const AUDIO_TYPES: string[] = [
  InternalFileType.AAC,
  InternalFileType.MIDI,
  InternalFileType.MID,
  InternalFileType.MP3,
  InternalFileType.OGA,
  InternalFileType.OPUS,
  InternalFileType.WAV,
  InternalFileType.WEBA,
  InternalFileType.THREEGP,
  InternalFileType.THREEG2,
];

const VIDEO_TYPES: string[] = [
  InternalFileType.AVI,
  InternalFileType.MP4,
  InternalFileType.MPEG,
  InternalFileType.OGV,
  InternalFileType.TS,
  InternalFileType.WEBM,
];

const TEXT_TYPES: string[] = [
  InternalFileType.TXT,
  InternalFileType.TEXT,
  InternalFileType.CSS,
  InternalFileType.CSH,
  InternalFileType.HTM,
  InternalFileType.HTML,
  InternalFileType.ICS,
  InternalFileType.JS,
  InternalFileType.JSON,
  InternalFileType.JSONLD,
  InternalFileType.MJS,
  InternalFileType.SH,
  InternalFileType.XML,
  InternalFileType.XPS,
  InternalFileType.XHTML,
];

const OTHER_TYPES: string[] = [
  // Archives
  InternalFileType.ARC,
  InternalFileType.BZ,
  InternalFileType.BZ2,
  InternalFileType.GZ,
  InternalFileType.RAR,
  InternalFileType.SEVENZ,
  InternalFileType.TAR,
  InternalFileType.ZIP,
  // Fonts
  InternalFileType.EOT,
  InternalFileType.OTF,
  InternalFileType.TTF,
  InternalFileType.WOFF,
  InternalFileType.WOFF2,
];

export const FORMAT_GROUP_TYPES: Record<EFormatGroup, string[] | null> = {
  [EFormatGroup.ALL]: null,
  [EFormatGroup.PDF]: PDF_TYPES,
  [EFormatGroup.IMAGE]: IMAGE_TYPES,
  [EFormatGroup.WORD]: WORD_TYPES,
  [EFormatGroup.SPREADSHEET]: SPREADSHEET_TYPES,
  [EFormatGroup.PRESENTATION]: PRESENTATION_TYPES,
  [EFormatGroup.EBOOK]: EBOOK_TYPES,
  [EFormatGroup.AUDIO]: AUDIO_TYPES,
  [EFormatGroup.VIDEO]: VIDEO_TYPES,
  [EFormatGroup.TEXT]: TEXT_TYPES,
  [EFormatGroup.OTHER]: OTHER_TYPES,
};

export const isFileInGroup = (
  internalType: string,
  group: EFormatGroup
): boolean => {
  const types = FORMAT_GROUP_TYPES[group];
  if (!types) return true;

  return types.includes(internalType.toUpperCase());
};
