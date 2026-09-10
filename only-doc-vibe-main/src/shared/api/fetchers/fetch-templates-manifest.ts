import { CMS_HOST } from "astro:env/server";

import type { components } from "../cms/cms-schema";
import { getAllRoutes } from "../cms/cms-http-client";
import { STRAPI_ROUTES } from "../strapi-routes";
import { getCmsMediaUrl } from "../../lib/cms/get-cms-media-url";
import { logger } from "../../lib/utils/logger";
import { stripSlashes } from "../../lib/utils/stripSlashes";

type TemplatePage = components["schemas"]["TemplatePage"];

const MANIFEST_QUERY = [
  "fields[0]=slug",
  "populate[polotno_document][fields][0]=url",
  "pagination[pageSize]=100",
].join("&");

/**
 * Build a public `{ slug: polotnoDocumentUrl }` manifest for the template
 * editor. Strapi uploads are public, so the editor island can fetch the JSON
 * directly at runtime by slug.
 */
export const fetchTemplatesManifest = async (
  locale: string
): Promise<Record<string, string>> => {
  try {
    const pages = await getAllRoutes<TemplatePage>(
      `${STRAPI_ROUTES.TEMPLATE_PAGES}?${MANIFEST_QUERY}&locale=${locale}`
    );

    const manifest: Record<string, string> = {};
    for (const page of pages) {
      const slug = stripSlashes(page.slug);
      const doc = page.polotno_document as { url?: string } | null;
      const url = getCmsMediaUrl(doc?.url, CMS_HOST);
      if (slug && url) manifest[slug] = url;
    }

    return manifest;
  } catch (error) {
    logger.error(
      `Failed to build templates manifest for locale: ${locale}`,
      error
    );

    return {};
  }
};
