import { CMS_HOST } from "astro:env/server";

import type { components } from "../cms/cms-schema";
import { getAllRoutes } from "../cms/cms-http-client";
import { STRAPI_ROUTES } from "../strapi-routes";
import { getCmsMediaUrl } from "../../lib/cms/get-cms-media-url";
import { logger } from "../../lib/utils/logger";
import { stripSlashes } from "../../lib/utils/stripSlashes";

type TemplatePage = components["schemas"]["TemplatePage"];

export interface EditorTemplateCategory {
  name: string;
  title: string;
  subCategories: { name: string; title: string }[];
}

export interface EditorTemplate {
  templateId: string;
  title: string;
  category: string;
  subCategories: string[];
  coverImageUrl?: string;
  polotnoUrl: string;
}

export interface EditorTemplatesData {
  categories: EditorTemplateCategory[];
  templates: EditorTemplate[];
}

const QUERY = [
  "fields[0]=slug",
  "fields[1]=title",
  "fields[2]=category_tag",
  "populate[polotno_document][fields][0]=url",
  "populate[cover_image][fields][0]=url",
  "populate[category][fields][0]=slug",
  "populate[category][fields][1]=title",
  "populate[subcategory][fields][0]=slug",
  "populate[subcategory][fields][1]=title",
  "pagination[pageSize]=100",
].join("&");

/**
 * Build the in-editor template gallery dataset from the CMS: only OnlyDoc
 * template pages that have a polotno document. Categories are derived from the
 * pages themselves so the sidebar only lists categories with loadable
 * templates. Embedded into the editor page and consumed by the React island.
 */
export const fetchEditorTemplates = async (
  locale: string
): Promise<EditorTemplatesData> => {
  try {
    const pages = await getAllRoutes<TemplatePage>(
      `${STRAPI_ROUTES.TEMPLATE_PAGES}?${QUERY}&locale=${locale}`
    );

    const templates: EditorTemplate[] = [];
    const categoryMap = new Map<string, EditorTemplateCategory>();
    const seenSubcategories = new Map<string, Set<string>>();

    for (const page of pages) {
      const slug = stripSlashes(page.slug);
      const doc = page.polotno_document as { url?: string } | null;
      const polotnoUrl = getCmsMediaUrl(doc?.url, CMS_HOST);
      if (!slug || !polotnoUrl) continue;

      const category = page.category as {
        slug?: string;
        title?: string;
      } | null;
      const subcategory = page.subcategory as {
        slug?: string;
        title?: string;
      } | null;
      const cover = page.cover_image as { url?: string } | null;

      const categorySlug =
        stripSlashes(category?.slug) || stripSlashes(page.category_tag);
      const subcategorySlug = stripSlashes(subcategory?.slug);

      templates.push({
        templateId: slug,
        title: page.title ?? slug,
        category: categorySlug,
        subCategories: subcategorySlug ? [subcategorySlug] : [],
        coverImageUrl: getCmsMediaUrl(cover?.url, CMS_HOST),
        polotnoUrl,
      });

      if (!categorySlug) continue;

      let categoryEntry = categoryMap.get(categorySlug);
      if (!categoryEntry) {
        categoryEntry = {
          name: categorySlug,
          title: category?.title ?? categorySlug,
          subCategories: [],
        };
        categoryMap.set(categorySlug, categoryEntry);
        seenSubcategories.set(categorySlug, new Set());
      }

      const seen = seenSubcategories.get(categorySlug);
      if (subcategorySlug && seen && !seen.has(subcategorySlug)) {
        seen.add(subcategorySlug);
        categoryEntry.subCategories.push({
          name: subcategorySlug,
          title: subcategory?.title ?? subcategorySlug,
        });
      }
    }

    const categories = [...categoryMap.values()].sort((a, b) =>
      a.title.localeCompare(b.title)
    );

    return { categories, templates };
  } catch (error) {
    logger.error(
      `Failed to build editor templates for locale: ${locale}`,
      error
    );

    return { categories: [], templates: [] };
  }
};
