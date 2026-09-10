import wordIcon from "@public/assets/modal/word-icon.svg?url";
import pdfIcon from "@public/assets/modal/pdf-icon.svg?url";
import fileIcon from "@public/assets/modal/file-icon.svg?url";

import { InternalFileType } from "@/shared/constants/file-type";

import { EOcrExportFormat, type IOcrExportFormatItem } from "../types";

export const SUPPORTED_OCR_EXPORT_FORMATS = [
  EOcrExportFormat.TXT,
  EOcrExportFormat.PDF_SEARCHABLE,
  EOcrExportFormat.DOCX,
];

export const OCR_EXPORT_FORMAT_TO_INTERNAL_FILE_TYPE_MAP = {
  [EOcrExportFormat.DOCX]: InternalFileType.DOCX,
  [EOcrExportFormat.PDF_SEARCHABLE]: InternalFileType.PDF,
  [EOcrExportFormat.TXT]: InternalFileType.TXT,
};

export const OCR_EXPORT_FORMATS: IOcrExportFormatItem[] = [
  {
    to: EOcrExportFormat.DOCX,
    converterName: "ocr-docx",
    icon: wordIcon,
  },
  {
    to: EOcrExportFormat.PDF_SEARCHABLE,
    converterName: "ocr-pdf-searchable",
    icon: pdfIcon,
  },
  {
    to: EOcrExportFormat.TXT,
    converterName: "ocr-txt",
    icon: fileIcon,
  },
];
