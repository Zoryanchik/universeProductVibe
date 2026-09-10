import { CMS_HOST } from "astro:env/server";

import { cmsHttpClient } from "@/shared/api/cms/cms-http-client";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";
import { normalizeBlogArticleMedia } from "@/shared/lib/blog/normalize-blog-media";
import { logger } from "@/shared/lib/utils/logger";
import type {
  IBlogArticle,
  IStrapiCollectionResponse,
} from "@/shared/types/blog";

import { ARTICLES_PER_PAGE } from "../model/constants";

interface FetchBlogArticlesArgs {
  readonly locale: string;
  readonly page?: number;
  readonly pageSize?: number;
  readonly categorySlug?: string;
  readonly authorSlug?: string;
}

const ARTICLE_LIST_FIELDS = [
  "fields[0]=slug",
  "fields[1]=title",
  "fields[2]=subtitle",
  "fields[3]=publication_date",
  "fields[4]=updatedAt",
  "fields[5]=reading_time",
  "fields[6]=views_number",
  "populate[bg_image][fields][0]=url",
  "populate[bg_image][fields][1]=alternativeText",
  "populate[bg_image][fields][2]=width",
  "populate[bg_image][fields][3]=height",
  "populate[category][fields][0]=slug",
  "populate[category][fields][1]=name",
  "populate[author][fields][0]=slug",
  "populate[author][fields][1]=name",
].join("&");

/**
 * Paginated article listing. Optionally filters by category and/or author slug.
 */
export const fetchBlogArticles = async ({
  locale,
  page = 1,
  pageSize = ARTICLES_PER_PAGE,
  categorySlug,
  authorSlug,
}: FetchBlogArticlesArgs): Promise<{
  readonly articles: ReadonlyArray<IBlogArticle>;
  readonly pageCount: number;
  readonly total: number;
}> => {
  const params: string[] = [
    `locale=${locale}`,
    `pagination[page]=${page}`,
    `pagination[pageSize]=${pageSize}`,
    "sort[0]=publication_date:desc",
    ARTICLE_LIST_FIELDS,
  ];

  if (categorySlug) {
    params.push(`filters[category][slug][$eq]=${categorySlug}`);
  }

  if (authorSlug) {
    params.push(`filters[author][slug][$eq]=${authorSlug}`);
  }

  const url = `${STRAPI_ROUTES.BLOG_ARTICLE_PAGES}?${params.join("&")}`;

  try {
    const response =
      await cmsHttpClient.getPage<IStrapiCollectionResponse<IBlogArticle>>(url);

    return {
      articles: (response?.data ?? []).map((article) =>
        normalizeBlogArticleMedia(article, CMS_HOST)
      ),
      pageCount: response?.meta?.pagination?.pageCount ?? 0,
      total: response?.meta?.pagination?.total ?? 0,
    };
  } catch (error) {
    logger.warn(
      `Blog: failed to fetch articles (locale=${locale}, category=${categorySlug ?? "-"}, page=${page}): ${String(error)}`
    );

    return { articles: [], pageCount: 0, total: 0 };
  }
};

/**
 * Fetch all article slugs (across all pages) for a locale. Used for
 * `getStaticPaths` and reserved-slug validation.
 */
export const fetchAllArticleSlugs = async (
  locale: string
): Promise<
  ReadonlyArray<{
    readonly slug: string;
    readonly updatedAt?: string;
    readonly publishedAt?: string;
    readonly localizations?: ReadonlyArray<{
      readonly slug: string;
      readonly locale: string;
    }>;
  }>
> => {
  const slugs: Array<{
    slug: string;
    updatedAt?: string;
    publishedAt?: string;
    localizations?: Array<{ slug: string; locale: string }>;
  }> = [];

  let currentPage = 1;
  let pageCount = 0;

  do {
    try {
      const response = await cmsHttpClient.getPage<
        IStrapiCollectionResponse<{
          slug: string;
          updatedAt?: string;
          publishedAt?: string;
          localizations?: Array<{ slug: string; locale: string }>;
        }>
      >(
        `${STRAPI_ROUTES.BLOG_ARTICLE_PAGES}?locale=${locale}` +
          `&pagination[page]=${currentPage}&pagination[pageSize]=100` +
          `&populate[localizations][fields][0]=slug` +
          `&populate[localizations][fields][1]=locale`
      );

      const items = response?.data ?? [];
      slugs.push(
        ...items.map((item) => ({
          slug: item.slug,
          updatedAt: item.updatedAt,
          publishedAt: item.publishedAt,
          localizations: item.localizations,
        }))
      );

      pageCount = response?.meta?.pagination?.pageCount ?? 0;
      currentPage++;
    } catch (error) {
      logger.warn(
        `Blog: failed to fetch article slugs page ${currentPage} for ${locale}: ${String(error)}`
      );
      break;
    }
  } while (currentPage <= pageCount);

  return slugs;
};
