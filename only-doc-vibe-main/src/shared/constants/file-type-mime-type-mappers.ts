import { InternalFileType } from "./file-type";
import { EMimeType } from "./mime-type";

export const internalFileTypeToMimeType = (
  type: InternalFileType
): EMimeType => {
  switch (type) {
    // Audio formats
    case InternalFileType.AAC:
      return EMimeType.AAC;
    case InternalFileType.MIDI:
    case InternalFileType.MID:
      return EMimeType.MIDI;
    case InternalFileType.MP3:
      return EMimeType.MP3;
    case InternalFileType.OGA:
      return EMimeType.OGA;
    case InternalFileType.OPUS:
      return EMimeType.OPUS;
    case InternalFileType.WAV:
      return EMimeType.WAV;
    case InternalFileType.WEBA:
      return EMimeType.WEBA;
    case InternalFileType.THREEGP:
      return EMimeType.THREEGPP_AUDIO;
    case InternalFileType.THREEG2:
      return EMimeType.THREEG2_AUDIO;

    // Video formats
    case InternalFileType.AVI:
      return EMimeType.AVI;
    case InternalFileType.MP4:
      return EMimeType.MP4;
    case InternalFileType.MPEG:
      return EMimeType.MPEG;
    case InternalFileType.OGV:
      return EMimeType.OGV;
    case InternalFileType.TS:
      return EMimeType.TS;
    case InternalFileType.WEBM:
      return EMimeType.WEBM;

    // Image formats
    case InternalFileType.AVIF:
      return EMimeType.AVIF;
    case InternalFileType.BMP:
      return EMimeType.BMP;
    case InternalFileType.GIF:
      return EMimeType.GIF;
    case InternalFileType.HEIC:
      return EMimeType.HEIC;
    case InternalFileType.HEIF:
      return EMimeType.HEIF;
    case InternalFileType.ICO:
      return EMimeType.ICO;
    case InternalFileType.JPEG:
      return EMimeType.JPEG;
    case InternalFileType.JPG:
      return EMimeType.JPG;
    case InternalFileType.JFIF:
      return EMimeType.JFIF;
    case InternalFileType.PNG:
      return EMimeType.PNG;
    case InternalFileType.SVG:
      return EMimeType.SVG;
    case InternalFileType.TIFF:
      return EMimeType.TIFF;
    case InternalFileType.TIF:
      return EMimeType.TIF;
    case InternalFileType.WEBP:
      return EMimeType.WEBP;
    case InternalFileType.DJVU:
      return EMimeType.DJVU;
    case InternalFileType.DWG:
      return EMimeType.DWG;
    case InternalFileType.DXF:
      return EMimeType.DXF;
    case InternalFileType.EPS:
      return EMimeType.EPS;

    // Document formats
    case InternalFileType.PDF:
      return EMimeType.PDF;
    case InternalFileType.ABW:
      return EMimeType.ABW;
    case InternalFileType.DOC:
      return EMimeType.DOC;
    case InternalFileType.DOCX:
      return EMimeType.DOCX;
    case InternalFileType.ODT:
      return EMimeType.ODT;
    case InternalFileType.RTF:
      return EMimeType.RTF;
    case InternalFileType.XPS:
      return EMimeType.XPS;

    // Spreadsheet formats
    case InternalFileType.CSV:
      return EMimeType.CSV;
    case InternalFileType.ODS:
      return EMimeType.ODS;
    case InternalFileType.XLS:
      return EMimeType.XLS;
    case InternalFileType.XLSX:
      return EMimeType.XLSX;

    // Presentation formats
    case InternalFileType.ODP:
      return EMimeType.ODP;
    case InternalFileType.PPT:
      return EMimeType.PPT;
    case InternalFileType.PPTX:
      return EMimeType.PPTX;

    // E-book formats
    case InternalFileType.AZW:
      return EMimeType.AZW;
    case InternalFileType.AZW3:
      return EMimeType.AZW3;
    case InternalFileType.CBR:
      return EMimeType.CBR;
    case InternalFileType.EPUB:
      return EMimeType.EPUB;
    case InternalFileType.MOBI:
      return EMimeType.MOBI;

    // Archive formats
    case InternalFileType.ARC:
      return EMimeType.ARC;
    case InternalFileType.BZ:
      return EMimeType.BZ;
    case InternalFileType.BZ2:
      return EMimeType.BZ2;
    case InternalFileType.GZ:
      return EMimeType.GZ;
    case InternalFileType.RAR:
      return EMimeType.RAR;
    case InternalFileType.SEVENZ:
      return EMimeType.SEVENZ;
    case InternalFileType.TAR:
      return EMimeType.TAR;
    case InternalFileType.ZIP:
      return EMimeType.ZIP;

    // Font formats
    case InternalFileType.EOT:
      return EMimeType.EOT;
    case InternalFileType.OTF:
      return EMimeType.OTF;
    case InternalFileType.TTF:
      return EMimeType.TTF;
    case InternalFileType.WOFF:
      return EMimeType.WOFF;
    case InternalFileType.WOFF2:
      return EMimeType.WOFF2;

    // Text formats
    case InternalFileType.CSS:
      return EMimeType.CSS;
    case InternalFileType.CSH:
      return EMimeType.CSH;
    case InternalFileType.HTM:
      return EMimeType.HTM;
    case InternalFileType.HTML:
      return EMimeType.HTML;
    case InternalFileType.ICS:
      return EMimeType.ICS;
    case InternalFileType.JS:
      return EMimeType.JS;
    case InternalFileType.JSON:
      return EMimeType.JSON;
    case InternalFileType.JSONLD:
      return EMimeType.JSONLD;
    case InternalFileType.MJS:
      return EMimeType.MJS;
    case InternalFileType.SH:
      return EMimeType.SH;
    case InternalFileType.TEXT:
    case InternalFileType.TXT:
      return EMimeType.TEXT;
    case InternalFileType.XML:
      return EMimeType.XML;
    case InternalFileType.XHTML:
      return EMimeType.XHTML;
    case InternalFileType.HWP:
      return EMimeType.HWP;

    // Application formats
    case InternalFileType.BIN:
      return EMimeType.BIN;
    case InternalFileType.CDA:
      return EMimeType.CDA;
    case InternalFileType.JAR:
      return EMimeType.JAR;
    case InternalFileType.MPKG:
      return EMimeType.MPKG;
    case InternalFileType.OGX:
      return EMimeType.OGX;
    case InternalFileType.PHP:
      return EMimeType.PHP;
    case InternalFileType.VSD:
      return EMimeType.VSD;
    case InternalFileType.XUL:
      return EMimeType.XUL;

    default:
      throw new Error(`Unknown mime-type for file type: ${type}`);
  }
};

export const mimeTypeToInternalFileType = (
  mimetype: string
): InternalFileType | null => {
  switch (mimetype) {
    // Audio formats
    case EMimeType.AAC:
      return InternalFileType.AAC;
    case EMimeType.MIDI:
      return InternalFileType.MIDI;
    case EMimeType.MP3:
      return InternalFileType.MP3;
    case EMimeType.OGA:
      return InternalFileType.OGA;
    case EMimeType.OPUS:
      return InternalFileType.OPUS;
    case EMimeType.WAV:
      return InternalFileType.WAV;
    case EMimeType.WEBA:
      return InternalFileType.WEBA;
    case EMimeType.THREEGPP_AUDIO:
      return InternalFileType.THREEGP;
    case EMimeType.THREEG2_AUDIO:
      return InternalFileType.THREEG2;

    // Video formats
    case EMimeType.AVI:
      return InternalFileType.AVI;
    case EMimeType.MP4:
      return InternalFileType.MP4;
    case EMimeType.MPEG:
      return InternalFileType.MPEG;
    case EMimeType.OGV:
      return InternalFileType.OGV;
    case EMimeType.TS:
      return InternalFileType.TS;
    case EMimeType.WEBM:
      return InternalFileType.WEBM;
    case EMimeType.THREEGPP_VIDEO:
      return InternalFileType.THREEGP;
    case EMimeType.THREEG2_VIDEO:
      return InternalFileType.THREEG2;

    // Image formats
    case EMimeType.AVIF:
      return InternalFileType.AVIF;
    case EMimeType.BMP:
      return InternalFileType.BMP;
    case EMimeType.GIF:
      return InternalFileType.GIF;
    case EMimeType.HEIC:
      return InternalFileType.HEIC;
    case EMimeType.HEIF:
      return InternalFileType.HEIF;
    case EMimeType.ICO:
      return InternalFileType.ICO;
    case EMimeType.JPEG:
      return InternalFileType.JPEG;
    case EMimeType.JPG:
      return InternalFileType.JPG;
    case EMimeType.JFIF:
      return InternalFileType.JFIF;
    case EMimeType.PNG:
      return InternalFileType.PNG;
    case EMimeType.SVG:
      return InternalFileType.SVG;
    case EMimeType.TIFF:
      return InternalFileType.TIFF;
    case EMimeType.TIF:
      return InternalFileType.TIF;
    case EMimeType.WEBP:
      return InternalFileType.WEBP;
    case EMimeType.DJVU:
      return InternalFileType.DJVU;
    case EMimeType.DWG:
      return InternalFileType.DWG;
    case EMimeType.DXF:
      return InternalFileType.DXF;
    case EMimeType.EPS:
      return InternalFileType.EPS;

    // Document formats
    case EMimeType.PDF:
      return InternalFileType.PDF;
    case EMimeType.ABW:
      return InternalFileType.ABW;
    case EMimeType.DOC:
      return InternalFileType.DOC;
    case EMimeType.DOCX:
      return InternalFileType.DOCX;
    case EMimeType.ODT:
      return InternalFileType.ODT;
    case EMimeType.RTF:
      return InternalFileType.RTF;

    // Spreadsheet formats
    case EMimeType.CSV:
      return InternalFileType.CSV;
    case EMimeType.ODS:
      return InternalFileType.ODS;
    case EMimeType.XLS:
      return InternalFileType.XLS;
    case EMimeType.XLSX:
      return InternalFileType.XLSX;

    // Presentation formats
    case EMimeType.ODP:
      return InternalFileType.ODP;
    case EMimeType.PPT:
      return InternalFileType.PPT;
    case EMimeType.PPTX:
      return InternalFileType.PPTX;

    // E-book formats
    case EMimeType.AZW:
      return InternalFileType.AZW;
    case EMimeType.AZW3:
      return InternalFileType.AZW3;
    case EMimeType.CBR:
      return InternalFileType.CBR;
    case EMimeType.EPUB:
      return InternalFileType.EPUB;
    case EMimeType.MOBI:
      return InternalFileType.MOBI;

    // Archive formats
    case EMimeType.ARC:
      return InternalFileType.ARC;
    case EMimeType.BZ:
      return InternalFileType.BZ;
    case EMimeType.BZ2:
      return InternalFileType.BZ2;
    case EMimeType.GZ:
      return InternalFileType.GZ;
    case EMimeType.RAR:
      return InternalFileType.RAR;
    case EMimeType.SEVENZ:
      return InternalFileType.SEVENZ;
    case EMimeType.TAR:
      return InternalFileType.TAR;
    case EMimeType.ZIP:
      return InternalFileType.ZIP;

    // Font formats
    case EMimeType.EOT:
      return InternalFileType.EOT;
    case EMimeType.OTF:
      return InternalFileType.OTF;
    case EMimeType.TTF:
      return InternalFileType.TTF;
    case EMimeType.WOFF:
      return InternalFileType.WOFF;
    case EMimeType.WOFF2:
      return InternalFileType.WOFF2;

    // Text formats
    case EMimeType.CSS:
      return InternalFileType.CSS;
    case EMimeType.CSH:
      return InternalFileType.CSH;
    case EMimeType.HTM:
      return InternalFileType.HTM;
    case EMimeType.HTML:
      return InternalFileType.HTML;
    case EMimeType.ICS:
      return InternalFileType.ICS;
    case EMimeType.JS:
      return InternalFileType.JS;
    case EMimeType.JSON:
      return InternalFileType.JSON;
    case EMimeType.JSONLD:
      return InternalFileType.JSONLD;
    case EMimeType.MJS:
      return InternalFileType.MJS;
    case EMimeType.SH:
      return InternalFileType.SH;
    case EMimeType.TEXT:
    case EMimeType.TXT:
      return InternalFileType.TXT;
    case EMimeType.XML:
      return InternalFileType.XML;
    case EMimeType.XHTML:
      return InternalFileType.XHTML;

    // Application formats
    case EMimeType.BIN:
      return InternalFileType.BIN;
    case EMimeType.CDA:
      return InternalFileType.CDA;
    case EMimeType.JAR:
      return InternalFileType.JAR;
    case EMimeType.MPKG:
      return InternalFileType.MPKG;
    case EMimeType.OGX:
      return InternalFileType.OGX;
    case EMimeType.PHP:
      return InternalFileType.PHP;
    case EMimeType.VSD:
      return InternalFileType.VSD;
    case EMimeType.XUL:
      return InternalFileType.XUL;

    default:
      return null;
  }
};
