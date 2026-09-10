import { cmsHttpClient } from "@/shared/api/cms/cms-http-client";
import type { components } from "@/shared/api/cms/cms-schema";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";
import type { ELanguages } from "@/shared/constants/languages";
import { logger } from "@/shared/lib/utils/logger";

type LegalPageListResponse = components["schemas"]["LegalPageListResponse"];
type LegalPageData = components["schemas"]["LegalPage"];

export const fetchLegalPage = async (
  slug: string,
  locale: ELanguages
): Promise<LegalPageData | undefined> => {
  try {
    // CMS legal slugs are stored inconsistently across locales: some entries
    // have a leading slash (`/privacy-policy`), some don't (`privacy-policy`).
    // Our route params always drop the slash for clean URLs, so we match
    // either shape via `$or` to stay resilient to whichever way the CMS
    // editor authored the entry.
    const slugWithoutSlash = slug.replace(/^\//, "");
    const slugWithSlash = `/${slugWithoutSlash}`;
    const response = await cmsHttpClient.getPage<LegalPageListResponse>(
      `${STRAPI_ROUTES.LEGAL_PAGES}` +
        `?filters[$or][0][slug][$eq]=${slugWithSlash}` +
        `&filters[$or][1][slug][$eq]=${slugWithoutSlash}` +
        `&locale=${locale}&pLevel=6`
    );

    if (!response?.data?.[0]) {
      logger.warn(`Legal page not found for slug: ${slug} (locale: ${locale})`);

      return undefined;
    }

    return response.data[0];
  } catch (error) {
    logger.error(
      `Failed to fetch legal page for slug: ${slug} (locale: ${locale})`,
      error
    );

    return undefined;
  }
};
