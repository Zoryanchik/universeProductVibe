import fileTypeExel from "@public/assets/modal/excel-icon.svg?url";
import fileTypeGeneric from "@public/assets/modal/file-icon.svg?url";
import fileTypeIMG from "@public/assets/modal/image-icon.svg?url";
import fileTypePDF from "@public/assets/modal/pdf-icon.svg?url";
import fileTypePPTX from "@public/assets/modal/pptx-icon.svg?url";
import fileTypeWord from "@public/assets/modal/word-icon.svg?url";
import fileTypeAZW3 from "@public/assets/modal/azw3-icon.svg?url";

import {
  InternalFileType,
  isImageFileType,
} from "../../../constants/file-type";

export interface IFormatDictionaryOption {
  label: string;
  to: InternalFileType;
  icon: string;
  format: string;
}

const getIconByFormat = (format: InternalFileType): string => {
  if (format === InternalFileType.PDF) return fileTypePDF;

  if (format === InternalFileType.AZW3 || format === InternalFileType.AZW) {
    return fileTypeAZW3;
  }

  if (
    format === InternalFileType.XLS ||
    format === InternalFileType.XLSX ||
    format === InternalFileType.CSV
  ) {
    return fileTypeExel;
  }

  if (format === InternalFileType.PPT || format === InternalFileType.PPTX) {
    return fileTypePPTX;
  }

  if (
    format === InternalFileType.DOC ||
    format === InternalFileType.DOCX ||
    format === InternalFileType.RTF ||
    format === InternalFileType.ODT ||
    format === InternalFileType.TEXT ||
    format === InternalFileType.TXT
  ) {
    return fileTypeWord;
  }

  if (isImageFileType(format)) return fileTypeIMG;

  return fileTypeGeneric;
};

export const createFormatOption = (
  format: InternalFileType
): IFormatDictionaryOption => ({
  label: format,
  to: format,
  icon: getIconByFormat(format),
  format: `.${format.toLowerCase()}`,
});

export const FORMATS_DICTIONARY: Partial<
  Record<InternalFileType, IFormatDictionaryOption[]>
> = {
  [InternalFileType.PDF]: [
    {
      label: "PDF",
      icon: fileTypePDF,
      to: InternalFileType.PDF,
      format: ".pdf",
    },
    {
      label: "Excel",
      icon: fileTypeExel,
      to: InternalFileType.XLSX,
      format: ".xlsx",
    },
    {
      label: "Word",
      to: InternalFileType.DOCX,
      icon: fileTypeWord,
      format: ".docx",
    },
    {
      label: "PPTX",
      to: InternalFileType.PPTX,
      icon: fileTypePPTX,
      format: ".pptx",
    },
    {
      label: "PNG",
      icon: fileTypeIMG,
      to: InternalFileType.PNG,
      format: ".png",
    },
    {
      label: "JPG",
      to: InternalFileType.JPG,
      icon: fileTypeIMG,
      format: ".jpg",
    },
    {
      label: "TIFF",
      to: InternalFileType.TIFF,
      icon: fileTypeIMG,
      format: ".tiff",
    },
    {
      label: "AZW3",
      to: InternalFileType.AZW3,
      icon: fileTypeAZW3,
      format: ".azw3",
    },
  ],
  [InternalFileType.PNG]: [
    {
      label: "PDF",
      icon: fileTypePDF,
      to: InternalFileType.PDF,
      format: ".pdf",
    },
    {
      label: "JPG",
      to: InternalFileType.JPG,
      icon: fileTypeIMG,
      format: ".jpg",
    },
  ],
  [InternalFileType.DOC]: [
    {
      label: "PDF",
      icon: fileTypePDF,
      to: InternalFileType.PDF,
      format: ".pdf",
    },
    {
      label: "PNG",
      icon: fileTypeIMG,
      to: InternalFileType.PNG,
      format: ".png",
    },
    {
      label: "JPG",
      to: InternalFileType.JPG,
      icon: fileTypeIMG,
      format: ".jpg",
    },
  ],
  [InternalFileType.DOCX]: [
    {
      label: "PDF",
      icon: fileTypePDF,
      to: InternalFileType.PDF,
      format: ".pdf",
    },
    {
      label: "PNG",
      icon: fileTypeIMG,
      to: InternalFileType.PNG,
      format: ".png",
    },
    {
      label: "JPG",
      to: InternalFileType.JPG,
      icon: fileTypeIMG,
      format: ".jpg",
    },
  ],
  [InternalFileType.JPG]: [
    {
      label: "PDF",
      icon: fileTypePDF,
      to: InternalFileType.PDF,
      format: ".pdf",
    },
    {
      label: "PNG",
      icon: fileTypeIMG,
      to: InternalFileType.PNG,
      format: ".png",
    },
  ],
  [InternalFileType.XLS]: [
    {
      label: "PDF",
      icon: fileTypePDF,
      to: InternalFileType.PDF,
      format: ".pdf",
    },
    {
      label: "PNG",
      icon: fileTypeIMG,
      to: InternalFileType.PNG,
      format: ".png",
    },
  ],
  [InternalFileType.XLSX]: [
    {
      label: "PDF",
      icon: fileTypePDF,
      to: InternalFileType.PDF,
      format: ".pdf",
    },
    {
      label: "PNG",
      icon: fileTypeIMG,
      to: InternalFileType.PNG,
      format: ".png",
    },
  ],
  [InternalFileType.PPT]: [
    {
      label: "PDF",
      icon: fileTypePDF,
      to: InternalFileType.PDF,
      format: ".pdf",
    },
    {
      label: "PNG",
      icon: fileTypeIMG,
      to: InternalFileType.PNG,
      format: ".png",
    },
  ],
  [InternalFileType.PPTX]: [
    {
      label: "PDF",
      icon: fileTypePDF,
      to: InternalFileType.PDF,
      format: ".pdf",
    },
    {
      label: "PNG",
      icon: fileTypeIMG,
      to: InternalFileType.PNG,
      format: ".png",
    },
  ],
  [InternalFileType.EPUB]: [
    {
      label: "PDF",
      icon: fileTypePDF,
      to: InternalFileType.PDF,
      format: ".pdf",
    },
  ],
};

export const DEFAULT_FORMATS_DICTIONARY: IFormatDictionaryOption[] = [
  {
    label: "PDF",
    to: InternalFileType.PDF,
    icon: fileTypePDF,
    format: ".pdf",
  },
];
