import type { components } from "@/shared/api/cms/cms-schema";
import type { InternalFileType } from "@/shared/constants/file-type";

import { EFunnels, EServiceType } from "@/entities/documents";

import type { IServiceFunctionalConfig } from "./service-config";

type ServicePage = components["schemas"]["ServicePage"];

const SERVICE_TYPE_MAP: Record<ServicePage["service_type"], EServiceType> = {
  CONVERTOR: EServiceType.CONVERTOR,
  COMPRESSOR: EServiceType.COMPRESSOR,
  OCR: EServiceType.OCR,
  REMOVE_WATERMARK: EServiceType.REMOVE_WATERMARK,
  ENHANCE: EServiceType.ENHANCE_IMAGE,
  UNLOCK: EServiceType.UNLOCK_PDF,
  TRANSLATE: EServiceType.TRANSLATE,
  EDITOR: EServiceType.EDITOR,
  AI_SUMMARIZER: EServiceType.AI_SUMMARIZER,
};

// Slugs whose funnel enum is not a 1:1 dash→underscore transform of the slug.
const SLUG_FUNNEL_OVERRIDES: Record<string, EFunnels> = {
  "delete-pages-from-pdf": EFunnels.DELETE_PDF_PAGES,
  "pdf-editor": EFunnels.EDIT_PDF,
};

function slugToFunnel(slug: string): EFunnels {
  const cleaned = slug.replace(/^\//, "");

  return (
    SLUG_FUNNEL_OVERRIDES[cleaned] ?? (cleaned.replace(/-/g, "_") as EFunnels)
  );
}

function parseCmsAcceptedFormats(raw: unknown): InternalFileType[] {
  if (!Array.isArray(raw)) return [];

  return raw.filter((v): v is InternalFileType => typeof v === "string");
}

export function parseCmsServiceConfig(
  pageData: ServicePage,
  slug: string
): IServiceFunctionalConfig | undefined {
  const serviceType = SERVICE_TYPE_MAP[pageData.service_type];
  const formatTo = pageData.format_to as InternalFileType | undefined;

  if (!serviceType || !formatTo) return undefined;

  const acceptedFormats = parseCmsAcceptedFormats(pageData.accepted_formats);

  return {
    serviceType,
    funnel: slugToFunnel(slug),
    formatTo,
    acceptedFormats,
  };
}
