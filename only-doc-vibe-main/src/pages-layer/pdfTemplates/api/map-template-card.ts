import { CMS_HOST } from "astro:env/server";

import type { components } from "@/shared/api/cms/cms-schema";
import { getCmsMediaUrl } from "@/shared/lib/cms/get-cms-media-url";
import { stripSlashes } from "@/shared/lib/utils/stripSlashes";

import type { ITemplateCard } from "../model/types";

/** Accepts a full `TemplatePage` or a populated relation stub of one. */
type TemplatePageLike = Partial<components["schemas"]["TemplatePage"]>;

/**
 * Map a raw CMS `TemplatePage` to the shared card shape (category label/slug +
 * cover). Returns `null` when the page has no usable slug. Single source of
 * truth for the catalog index, related templates and any card listing.
 */
export const mapTemplateCard = (
  page: TemplatePageLike | null | undefined
): ITemplateCard | null => {
  const slug = stripSlashes(page?.slug);
  if (!page || !slug) return null;

  const category = page.category as { slug?: string; title?: string } | null;
  const cover = page.cover_image as {
    url?: string;
    alternativeText?: string;
  } | null;

  return {
    slug,
    title: page.title ?? slug,
    categoryLabel: category?.title ?? page.category_tag ?? "",
    categorySlug:
      stripSlashes(category?.slug) || stripSlashes(page.category_tag),
    coverImageUrl: getCmsMediaUrl(cover?.url, CMS_HOST),
    coverImageAlt: cover?.alternativeText || page.title || slug,
  };
};
