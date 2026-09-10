export enum InternalFileType {
  // PDF
  PDF = "PDF",

  // Audio formats
  AAC = "AAC",
  MIDI = "MIDI",
  MID = "MID",
  MP3 = "MP3",
  OGA = "OGA",
  OPUS = "OPUS",
  WAV = "WAV",
  WEBA = "WEBA",
  THREEGP = "3GP",
  THREEG2 = "3G2",

  // Video formats
  AVI = "AVI",
  MP4 = "MP4",
  MPEG = "MPEG",
  OGV = "OGV",
  TS = "TS",
  WEBM = "WEBM",

  // Images
  AVIF = "AVIF",
  BMP = "BMP",
  GIF = "GIF",
  HEIC = "HEIC",
  HEIF = "HEIF",
  ICO = "ICO",
  JPEG = "JPEG",
  JPG = "JPG",
  JFIF = "JFIF",
  PNG = "PNG",
  SVG = "SVG",
  TIFF = "TIFF",
  TIF = "TIF",
  WEBP = "WEBP",
  DJVU = "DJVU",
  DWG = "DWG",
  DXF = "DXF",
  EPS = "EPS",
  IMAGE = "IMAGE",

  // Word Processing
  ABW = "ABW",
  DOC = "DOC",
  DOCX = "DOCX",
  ODT = "ODT",
  RTF = "RTF",

  // Spreadsheets
  CSV = "CSV",
  ODS = "ODS",
  XLS = "XLS",
  XLSX = "XLSX",

  // Presentations
  ODP = "ODP",
  PPT = "PPT",
  PPTX = "PPTX",

  // E-books
  AZW = "AZW",
  AZW3 = "AZW3",
  CBR = "CBR",
  EPUB = "EPUB",
  MOBI = "MOBI",

  // Archives
  ARC = "ARC",
  BZ = "BZ",
  BZ2 = "BZ2",
  GZ = "GZ",
  RAR = "RAR",
  SEVENZ = "7Z",
  TAR = "TAR",
  ZIP = "ZIP",

  // Font formats
  EOT = "EOT",
  OTF = "OTF",
  TTF = "TTF",
  WOFF = "WOFF",
  WOFF2 = "WOFF2",

  // Text/Documents
  CSS = "CSS",
  CSH = "CSH",
  HTM = "HTM",
  HTML = "HTML",
  ICS = "ICS",
  JS = "JS",
  JSON = "JSON",
  JSONLD = "JSONLD",
  MJS = "MJS",
  SH = "SH",
  TEXT = "TEXT",
  TXT = "TXT",
  XML = "XML",
  XPS = "XPS",
  XHTML = "XHTML",
  HWP = "HWP",

  // Application formats
  BIN = "BIN",
  CDA = "CDA",
  JAR = "JAR",
  MPKG = "MPKG",
  OGX = "OGX",
  PHP = "PHP",
  VSD = "VSD",
  XUL = "XUL",
}

export const ALL_FILE_TYPES = Object.values(InternalFileType);

export const isInternalFileType = (
  value: unknown
): value is InternalFileType => {
  return ALL_FILE_TYPES.includes(value as InternalFileType);
};

export const UNCONVERTIBLE_ON_FE_FILE_TYPES = [
  InternalFileType.DOC,
  InternalFileType.DOCX,
  InternalFileType.XLS,
  InternalFileType.XLSX,
  InternalFileType.CSV,
  InternalFileType.PPT,
  InternalFileType.PPTX,
  InternalFileType.TXT,
  InternalFileType.TEXT,
  InternalFileType.EPUB,
  InternalFileType.HTML,
  InternalFileType.MOBI,
  InternalFileType.AZW3,
  InternalFileType.DJVU,
  InternalFileType.DWG,
  InternalFileType.DXF,
  InternalFileType.ZIP,
  InternalFileType.IMAGE,
  InternalFileType.EPS,
  InternalFileType.AZW,
  InternalFileType.SVG,
  InternalFileType.TIFF,
  InternalFileType.AVIF,
  InternalFileType.CBR,
  InternalFileType.RTF,
  InternalFileType.XPS,
  InternalFileType.GIF,
];

export const isUnconvertibleOnFeFileType = (
  fileType: InternalFileType | null | undefined
): fileType is (typeof UNCONVERTIBLE_ON_FE_FILE_TYPES)[number] =>
  UNCONVERTIBLE_ON_FE_FILE_TYPES.includes(fileType!);

export const CONVERTABLE_ON_FE_FILE_TYPES = ALL_FILE_TYPES.filter(
  (value) => !isUnconvertibleOnFeFileType(value)
);

export const IMAGE_FILE_TYPES = [
  InternalFileType.BMP,
  InternalFileType.EPS,
  InternalFileType.GIF,
  InternalFileType.TIFF,
  InternalFileType.WEBP,
  InternalFileType.JPG,
  InternalFileType.JPEG,
  InternalFileType.HEIC,
  InternalFileType.HEIF,
  InternalFileType.SVG,
  InternalFileType.PNG,
  InternalFileType.JPEG,
];

export const isImageFileType = (
  fileType: InternalFileType | null | undefined
): fileType is (typeof IMAGE_FILE_TYPES)[number] =>
  IMAGE_FILE_TYPES.includes(fileType!);

const HEIC_FILE_TYPES = [InternalFileType.HEIC, InternalFileType.HEIF];

export const isHeicFileType = (
  fileType: InternalFileType | null | undefined
): fileType is (typeof HEIC_FILE_TYPES)[number] =>
  HEIC_FILE_TYPES.includes(fileType!);
