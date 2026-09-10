import { cmsHttpClient } from "@/shared/api/cms/cms-http-client";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";
import { logger } from "@/shared/lib/utils/logger";
import type {
  IBlogCategory,
  IStrapiCollectionResponse,
} from "@/shared/types/blog";

/** Slug reserved for the virtual "All articles" category used as blog home page metadata. */
export const ALL_CATEGORY_SLUG = "all";

const normalizeSlug = (slug: string): string => slug.replace(/^\/+/, "");

const buildCategoriesUrl = (locale: string, deep: boolean): string => {
  const params = new URLSearchParams({
    locale,
    "pagination[pageSize]": "100",
  });

  if (deep) {
    params.set("pLevel", "4");
  } else {
    params.set("populate[inline_cta]", "true");
    params.set("populate[seo]", "true");
    params.set("populate[paginated_seo]", "true");
  }

  return `${STRAPI_ROUTES.BLOG_CATEGORIES}?${params.toString()}`;
};

const fetchRawCategories = async (
  locale: string
): Promise<ReadonlyArray<IBlogCategory>> => {
  const urls = [
    buildCategoriesUrl(locale, true),
    buildCategoriesUrl(locale, false),
  ];

  for (const url of urls) {
    try {
      const response =
        await cmsHttpClient.getPage<IStrapiCollectionResponse<IBlogCategory>>(
          url
        );

      const data = response?.data ?? [];

      if (data.length > 0) return data;
    } catch (error) {
      logger.warn(
        `Blog: failed to fetch categories (${url}) for locale ${locale}: ${String(error)}`
      );
    }
  }

  return [];
};

/**
 * Returns only real categories, excluding the reserved `all` slug.
 * Used by static-path generators — `all` must never become a route.
 */
export const fetchBlogCategories = async (
  locale: string
): Promise<ReadonlyArray<IBlogCategory>> => {
  const raw = await fetchRawCategories(locale);

  return raw.filter((c) => normalizeSlug(c.slug) !== ALL_CATEGORY_SLUG);
};

/**
 * Returns filtered categories together with the optional `all` category in
 * a single CMS call. Use this wherever both pieces of data are needed.
 */
export const fetchBlogCategoriesSplit = async (
  locale: string
): Promise<{
  readonly categories: ReadonlyArray<IBlogCategory>;
  readonly allCategory: IBlogCategory | undefined;
}> => {
  const raw = await fetchRawCategories(locale);

  return {
    categories: raw.filter((c) => normalizeSlug(c.slug) !== ALL_CATEGORY_SLUG),
    allCategory: raw.find((c) => normalizeSlug(c.slug) === ALL_CATEGORY_SLUG),
  };
};

export const findCategoryBySlug = (
  categories: ReadonlyArray<IBlogCategory>,
  slug: string
): IBlogCategory | undefined =>
  categories.find(
    (category) => normalizeSlug(category.slug) === normalizeSlug(slug)
  );
