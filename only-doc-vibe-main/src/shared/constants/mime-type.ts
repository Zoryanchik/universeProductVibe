/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
export enum EMimeType {
  // Audio formats
  AAC = "audio/aac",
  MIDI = "audio/midi",
  MP3 = "audio/mpeg",
  OGA = "audio/ogg",
  OPUS = "audio/opus",
  WAV = "audio/wav",
  WEBA = "audio/webm",
  THREEGPP_AUDIO = "audio/3gpp",
  THREEG2_AUDIO = "audio/3gpp2",

  // Video formats
  AVI = "video/x-msvideo",
  MP4 = "video/mp4",
  MPEG = "video/mpeg",
  OGV = "video/ogg",
  TS = "video/mp2t",
  WEBM = "video/webm",
  THREEGPP_VIDEO = "video/3gpp",
  THREEG2_VIDEO = "video/3gpp2",

  // Image formats
  AVIF = "image/avif",
  BMP = "image/bmp",
  GIF = "image/gif",
  HEIC = "image/heic",
  HEIF = "image/heic",
  ICO = "image/vnd.microsoft.icon",
  JPEG = "image/jpeg",
  JPG = "image/jpg",
  JFIF = "image/jpeg",
  PNG = "image/png",
  SVG = "image/svg+xml",
  TIFF = "image/tiff",
  TIF = "image/tiff",
  WEBP = "image/webp",
  DJVU = "image/vnd.djvu,.djvu",
  DWG = "image/vnd.dwg,.dwg",
  DXF = "image/x-dxf, .dxf",

  // Document formats
  PDF = "application/pdf",
  XPS = "application/vnd.ms-xpsdocument, .xps",
  DOC = "application/msword",
  DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ODT = "application/vnd.oasis.opendocument.text",
  RTF = "application/rtf",

  // Spreadsheet formats
  CSV = "text/csv",
  XLS = "application/vnd.ms-excel",
  XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ODS = "application/vnd.oasis.opendocument.spreadsheet",

  // Presentation formats
  PPT = "application/vnd.ms-powerpoint",
  PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ODP = "application/vnd.oasis.opendocument.presentation",

  // E-book formats
  EPUB = "application/epub+zip",
  AZW = "application/vnd.amazon.ebook, .azw, .azw3",
  AZW3 = "application/vnd.amazon.ebook, .azw3",
  MOBI = "application/x-mobipocket-ebook,.mobi",
  CBR = "application/x-cbr, .cbr",

  // Archive formats
  ZIP = "application/zip",
  RAR = "application/vnd.rar",
  TAR = "application/x-tar",
  GZ = "application/gzip",
  BZ = "application/x-bzip",
  BZ2 = "application/x-bzip2",
  SEVENZ = "application/x-7z-compressed",
  ARC = "application/x-freearc",

  // Font formats
  EOT = "application/vnd.ms-fontobject",
  OTF = "font/otf",
  TTF = "font/ttf",
  WOFF = "font/woff",
  WOFF2 = "font/woff2",

  // Text formats
  TEXT = "text/plain",
  TXT = "text/plain",
  CSS = "text/css",
  HTML = "text/html",
  HTM = "text/html",
  ICS = "text/calendar",
  JS = "text/javascript",
  MJS = "text/javascript",
  HWP = "application/x-hwp",

  // Application formats
  JSON = "application/json",
  JSONLD = "application/ld+json",
  XML = "application/xml",
  XHTML = "application/xhtml+xml",
  BIN = "application/octet-stream",
  PHP = "application/x-httpd-php",
  SH = "application/x-sh",
  CSH = "application/x-csh",
  JAR = "application/java-archive",
  OGX = "application/ogg",
  VSD = "application/vnd.visio",
  MPKG = "application/vnd.apple.installer+xml",
  XUL = "application/vnd.mozilla.xul+xml",
  CDA = "application/x-cdf",

  // Specialized document formats
  ABW = "application/x-abiword",
  EPS = "application/postscript",
}
