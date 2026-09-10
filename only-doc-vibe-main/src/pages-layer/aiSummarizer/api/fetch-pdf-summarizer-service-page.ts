import { cmsHttpClient } from "@/shared/api/cms/cms-http-client";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";
import { defaultLocale } from "@/shared/config/locale";
import { logger } from "@/shared/lib/utils/logger";
import type { components } from "@/shared/api/cms/cms-schema";

type ServicePageListResponse = components["schemas"]["ServicePageListResponse"];
type ServicePage = components["schemas"]["ServicePage"];

const SUMMARIZER_SLUG = "/pdf-summarizer";

/**
 * The chat page reuses the same ServicePage entry that the landing renders.
 * only-doc uses a single non-localized slug (`/pdf-summarizer`) for every
 * locale, so unlike pdf-fly-fe there's no per-locale slug lookup — Strapi is
 * expected to localize the *content* of one ServicePage entry, not its slug.
 *
 * Uses cmsHttpClient directly rather than reusing seoService's fetch helper —
 * pages-layer slices cannot import from each other under FSD.
 */
export async function fetchPdfSummarizerServicePage(
  locale: string = defaultLocale
): Promise<ServicePage | null> {
  try {
    const { data } = await cmsHttpClient.getPage<ServicePageListResponse>(
      `${STRAPI_ROUTES.SERVICE_PAGES}?pLevel=6&filters[slug][$eq]=${SUMMARIZER_SLUG}&locale=${locale}`
    );

    return data?.[0] ?? null;
  } catch (error) {
    logger.error(
      `Failed to fetch pdf-summarizer service page in locale ${locale}:`,
      error
    );

    return null;
  }
}
