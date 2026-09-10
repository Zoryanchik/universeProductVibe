import type { components } from "@/shared/api/cms/cms-schema";
import { getAllRoutes } from "@/shared/api/cms/cms-http-client";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";
import type { ELanguages } from "@/shared/constants/languages";
import { logger } from "@/shared/lib/utils/logger";
import { stripSlashes } from "@/shared/lib/utils/stripSlashes";

type TemplateCategory = components["schemas"]["TemplateCategory"];

export interface IRawTemplateCategory {
  readonly slug: string;
  readonly title: string;
  readonly subcategories: ReadonlyArray<{ slug: string; title: string }>;
}

const CATEGORIES_QUERY = [
  "fields[0]=slug",
  "fields[1]=title",
  "populate[template_subcategories][fields][0]=slug",
  "populate[template_subcategories][fields][1]=title",
  "pagination[pageSize]=100",
].join("&");

export const fetchTemplateCategories = async (
  locale: ELanguages
): Promise<ReadonlyArray<IRawTemplateCategory>> => {
  try {
    const categories = await getAllRoutes<TemplateCategory>(
      `${STRAPI_ROUTES.TEMPLATE_CATEGORIES}?${CATEGORIES_QUERY}&locale=${locale}`
    );

    return categories
      .map((category): IRawTemplateCategory | null => {
        const slug = stripSlashes(category.slug);
        if (!slug) return null;

        const subs = (category.template_subcategories ?? [])
          .map((sub) => ({
            slug: stripSlashes(sub.slug),
            title: sub.title ?? "",
          }))
          .filter((sub) => sub.slug);

        return { slug, title: category.title ?? slug, subcategories: subs };
      })
      .filter((c): c is IRawTemplateCategory => c !== null);
  } catch (error) {
    logger.error(
      `Failed to fetch template categories for locale: ${locale}`,
      error
    );

    return [];
  }
};
