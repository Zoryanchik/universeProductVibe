import type { components } from "@/shared/api/cms/cms-schema";

import type { AiSummarizerCmsConfig } from "./types";

type ServicePage = components["schemas"]["ServicePage"];

export const toAiSummarizerCmsConfig = (
  page: ServicePage
): AiSummarizerCmsConfig => ({
  acceptedFormats: Array.isArray(page.accepted_formats)
    ? (page.accepted_formats as readonly string[])
    : [],
  formatTo: String(page.format_to ?? "PDF"),
});
