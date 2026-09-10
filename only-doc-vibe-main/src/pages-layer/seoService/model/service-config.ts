import type { components } from "@/shared/api/cms/cms-schema";
import { InternalFileType } from "@/shared/constants/file-type";

import { EFunnels, EServiceType } from "@/entities/documents";

import { parseCmsServiceConfig } from "./parse-cms-service-config";

type ServicePage = components["schemas"]["ServicePage"];

export interface IServiceFunctionalConfig {
  readonly serviceType: EServiceType;
  readonly funnel: EFunnels;
  readonly formatTo: InternalFileType;
  readonly acceptedFormats: readonly InternalFileType[];
}

export const SERVICE_CONFIG: Readonly<
  Record<string, IServiceFunctionalConfig>
> = {
  "pdf-to-png": {
    serviceType: EServiceType.CONVERTOR,
    funnel: EFunnels.PDF_TO_PNG,
    formatTo: InternalFileType.PNG,
    acceptedFormats: [InternalFileType.PDF],
  },
  "pdf-to-jpg": {
    serviceType: EServiceType.CONVERTOR,
    funnel: EFunnels.PDF_TO_JPG,
    formatTo: InternalFileType.JPG,
    acceptedFormats: [InternalFileType.PDF],
  },
  "pdf-to-word": {
    serviceType: EServiceType.CONVERTOR,
    funnel: EFunnels.PDF_TO_WORD,
    formatTo: InternalFileType.DOCX,
    acceptedFormats: [InternalFileType.PDF],
  },
  "pdf-to-excel": {
    serviceType: EServiceType.CONVERTOR,
    funnel: EFunnels.PDF_TO_EXCEL,
    formatTo: InternalFileType.XLSX,
    acceptedFormats: [InternalFileType.PDF],
  },
  "pdf-to-pptx": {
    serviceType: EServiceType.CONVERTOR,
    funnel: EFunnels.PDF_TO_PPTX,
    formatTo: InternalFileType.PPTX,
    acceptedFormats: [InternalFileType.PDF],
  },
  "pdf-to-tiff": {
    serviceType: EServiceType.CONVERTOR,
    funnel: EFunnels.PDF_TO_TIFF,
    formatTo: InternalFileType.TIFF,
    acceptedFormats: [InternalFileType.PDF],
  },
  "pdf-to-azw3": {
    serviceType: EServiceType.CONVERTOR,
    funnel: EFunnels.PDF_TO_AZW3,
    formatTo: InternalFileType.AZW3,
    acceptedFormats: [InternalFileType.PDF],
  },
  "word-to-pdf": {
    serviceType: EServiceType.CONVERTOR,
    funnel: EFunnels.WORD_TO_PDF,
    formatTo: InternalFileType.PDF,
    acceptedFormats: [InternalFileType.DOC, InternalFileType.DOCX],
  },
  "excel-to-pdf": {
    serviceType: EServiceType.CONVERTOR,
    funnel: EFunnels.EXCEL_TO_PDF,
    formatTo: InternalFileType.PDF,
    acceptedFormats: [InternalFileType.XLS, InternalFileType.XLSX],
  },
  "jpg-to-pdf": {
    serviceType: EServiceType.CONVERTOR,
    funnel: EFunnels.JPG_TO_PDF,
    formatTo: InternalFileType.PDF,
    acceptedFormats: [InternalFileType.JPG, InternalFileType.JPEG],
  },
  "png-to-pdf": {
    serviceType: EServiceType.CONVERTOR,
    funnel: EFunnels.PNG_TO_PDF,
    formatTo: InternalFileType.PDF,
    acceptedFormats: [InternalFileType.PNG],
  },
  "pptx-to-pdf": {
    serviceType: EServiceType.CONVERTOR,
    funnel: EFunnels.PPTX_TO_PDF,
    formatTo: InternalFileType.PDF,
    acceptedFormats: [InternalFileType.PPT, InternalFileType.PPTX],
  },
  "tiff-to-pdf": {
    serviceType: EServiceType.CONVERTOR,
    funnel: EFunnels.TIFF_TO_PDF,
    formatTo: InternalFileType.PDF,
    acceptedFormats: [InternalFileType.TIFF, InternalFileType.TIF],
  },
  "azw3-to-pdf": {
    serviceType: EServiceType.CONVERTOR,
    funnel: EFunnels.AZW3_TO_PDF,
    formatTo: InternalFileType.PDF,
    acceptedFormats: [InternalFileType.AZW3],
  },
  "svg-to-pdf": {
    serviceType: EServiceType.CONVERTOR,
    funnel: EFunnels.SVG_TO_PDF,
    formatTo: InternalFileType.PDF,
    acceptedFormats: [InternalFileType.SVG],
  },
  "compress-pdf": {
    serviceType: EServiceType.COMPRESSOR,
    funnel: EFunnels.COMPRESS_PDF,
    formatTo: InternalFileType.PDF,
    acceptedFormats: [InternalFileType.PDF],
  },
  "pdf-ocr": {
    serviceType: EServiceType.OCR,
    funnel: EFunnels.PDF_OCR,
    formatTo: InternalFileType.PDF,
    acceptedFormats: [InternalFileType.PDF],
  },
  "remove-watermark": {
    serviceType: EServiceType.REMOVE_WATERMARK,
    funnel: EFunnels.REMOVE_WATERMARK,
    formatTo: InternalFileType.PDF,
    acceptedFormats: [
      InternalFileType.PDF,
      InternalFileType.JPG,
      InternalFileType.JPEG,
      InternalFileType.PNG,
      InternalFileType.BMP,
    ],
  },
  "unlock-pdf": {
    serviceType: EServiceType.UNLOCK_PDF,
    funnel: EFunnels.UNLOCK_PDF,
    formatTo: InternalFileType.PDF,
    acceptedFormats: [InternalFileType.PDF],
  },
  "enhance-image": {
    serviceType: EServiceType.ENHANCE_IMAGE,
    funnel: EFunnels.ENHANCE_IMAGE,
    formatTo: InternalFileType.JPG,
    acceptedFormats: [
      InternalFileType.JPG,
      InternalFileType.JPEG,
      InternalFileType.PNG,
    ],
  },
  "translate-pdf": {
    serviceType: EServiceType.TRANSLATE,
    funnel: EFunnels.TRANSLATE_PDF,
    formatTo: InternalFileType.PDF,
    acceptedFormats: [InternalFileType.PDF],
  },
  "pdf-summarizer": {
    serviceType: EServiceType.AI_SUMMARIZER,
    funnel: EFunnels.PDF_SUMMARIZER,
    formatTo: InternalFileType.PDF,
    acceptedFormats: [
      InternalFileType.PDF,
      InternalFileType.DOC,
      InternalFileType.DOCX,
      InternalFileType.PPTX,
      InternalFileType.TXT,
      InternalFileType.JPG,
      InternalFileType.JPEG,
      InternalFileType.PNG,
      InternalFileType.EPUB,
    ],
  },
  "merge-pdf": {
    serviceType: EServiceType.EDITOR,
    funnel: EFunnels.MERGE_PDF,
    formatTo: InternalFileType.PDF,
    acceptedFormats: [InternalFileType.PDF],
  },
  "split-pdf": {
    serviceType: EServiceType.EDITOR,
    funnel: EFunnels.SPLIT_PDF,
    formatTo: InternalFileType.PDF,
    acceptedFormats: [InternalFileType.PDF],
  },
  "sign-pdf": {
    serviceType: EServiceType.EDITOR,
    funnel: EFunnels.SIGN_PDF,
    formatTo: InternalFileType.PDF,
    acceptedFormats: [InternalFileType.PDF],
  },
  "edit-pdf": {
    serviceType: EServiceType.EDITOR,
    funnel: EFunnels.EDIT_PDF,
    formatTo: InternalFileType.PDF,
    acceptedFormats: [InternalFileType.PDF],
  },
  "pdf-editor": {
    serviceType: EServiceType.EDITOR,
    funnel: EFunnels.EDIT_PDF,
    formatTo: InternalFileType.PDF,
    acceptedFormats: [InternalFileType.PDF],
  },
  "delete-pages-from-pdf": {
    serviceType: EServiceType.EDITOR,
    funnel: EFunnels.DELETE_PDF_PAGES,
    formatTo: InternalFileType.PDF,
    acceptedFormats: [InternalFileType.PDF],
  },
  "rotate-pdf": {
    serviceType: EServiceType.EDITOR,
    funnel: EFunnels.ROTATE_PDF,
    formatTo: InternalFileType.PDF,
    acceptedFormats: [InternalFileType.PDF],
  },
  "pdf-reader": {
    serviceType: EServiceType.EDITOR,
    funnel: EFunnels.PDF_READER,
    formatTo: InternalFileType.PDF,
    acceptedFormats: [InternalFileType.PDF],
  },
};

export const normalizeServiceSlug = (slug: string): string =>
  slug.replace(/^\/|\/$/g, "");

export function getServiceConfig(
  slug: string
): IServiceFunctionalConfig | undefined {
  return SERVICE_CONFIG[normalizeServiceSlug(slug)];
}

/**
 * Routing is driven by the CMS `service_type`. `SERVICE_CONFIG` is only used as
 * an offline fallback when the page has no CMS data.
 */
export function resolveServiceConfig(
  slug: string,
  cmsPage?: ServicePage
): IServiceFunctionalConfig | undefined {
  const normalizedSlug = normalizeServiceSlug(slug);
  const cmsConfig = cmsPage
    ? parseCmsServiceConfig(cmsPage, normalizedSlug)
    : undefined;

  return cmsConfig ?? SERVICE_CONFIG[normalizedSlug];
}
