import type { components } from "@/shared/api/cms/cms-schema";
import { getAllRoutes } from "@/shared/api/cms/cms-http-client";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";
import type { ELanguages } from "@/shared/constants/languages";
import { logger } from "@/shared/lib/utils/logger";
import { stripSlashes } from "@/shared/lib/utils/stripSlashes";

import type { ITemplateCard } from "../model/types";
import { mapTemplateCard } from "./map-template-card";

type TemplatePage = components["schemas"]["TemplatePage"];

/** Card shape plus the subcategory used for grouping/filtering the full set. */
export interface ITemplateIndexEntry extends ITemplateCard {
  readonly subcategorySlug?: string;
}

const INDEX_QUERY = [
  "fields[0]=slug",
  "fields[1]=title",
  "fields[2]=category_tag",
  "populate[cover_image][fields][0]=url",
  "populate[cover_image][fields][1]=alternativeText",
  "populate[category][fields][0]=slug",
  "populate[category][fields][1]=title",
  "populate[subcategory][fields][0]=slug",
  "pagination[pageSize]=100",
].join("&");

const toEntry = (page: TemplatePage): ITemplateIndexEntry | null => {
  const card = mapTemplateCard(page);
  if (!card) return null;

  const subcategory = page.subcategory as { slug?: string } | null;

  return {
    ...card,
    subcategorySlug: stripSlashes(subcategory?.slug) || undefined,
  };
};

/**
 * Fetch the full, lightweight template index for a locale. Used to build the
 * catalog grid, category/subcategory listings, sidebar counts and search.
 * Returns `[]` when the CMS has no published templates.
 */
export const fetchTemplateIndex = async (
  locale: ELanguages
): Promise<ReadonlyArray<ITemplateIndexEntry>> => {
  try {
    const pages = await getAllRoutes<TemplatePage>(
      `${STRAPI_ROUTES.TEMPLATE_PAGES}?${INDEX_QUERY}&locale=${locale}`
    );

    return pages
      .map(toEntry)
      .filter((entry): entry is ITemplateIndexEntry => entry !== null);
  } catch (error) {
    logger.error(`Failed to fetch template index for locale: ${locale}`, error);

    return [];
  }
};
