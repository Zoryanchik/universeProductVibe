import { CMS_HOST } from "astro:env/server";

import { cmsHttpClient } from "@/shared/api/cms/cms-http-client";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";
import { normalizeBlogAuthorMedia } from "@/shared/lib/blog/normalize-blog-media";
import { logger } from "@/shared/lib/utils/logger";
import type {
  IBlogAuthor,
  IStrapiCollectionResponse,
} from "@/shared/types/blog";

export const fetchBlogAuthor = async (
  slug: string,
  locale: string
): Promise<IBlogAuthor | undefined> => {
  const normalizedSlug = slug.replace(/^\//, "");

  try {
    const response = await cmsHttpClient.getPage<
      IStrapiCollectionResponse<IBlogAuthor>
    >(
      `${STRAPI_ROUTES.BLOG_AUTHORS}` +
        `?filters[slug][$eq]=${normalizedSlug}` +
        `&locale=${locale}&pLevel=4`
    );

    const author = response?.data?.[0];

    return author ? normalizeBlogAuthorMedia(author, CMS_HOST) : undefined;
  } catch (error) {
    logger.warn(
      `Blog: failed to fetch author slug=${slug} locale=${locale}: ${String(error)}`
    );

    return undefined;
  }
};

export const fetchAllAuthorSlugs = async (
  locale: string
): Promise<
  ReadonlyArray<{
    readonly slug: string;
    readonly localizations?: ReadonlyArray<{
      readonly slug: string;
      readonly locale: string;
    }>;
  }>
> => {
  const slugs: Array<{
    slug: string;
    localizations?: Array<{ slug: string; locale: string }>;
  }> = [];

  let currentPage = 1;
  let pageCount = 0;

  do {
    try {
      const response = await cmsHttpClient.getPage<
        IStrapiCollectionResponse<{
          slug: string;
          localizations?: Array<{ slug: string; locale: string }>;
        }>
      >(
        `${STRAPI_ROUTES.BLOG_AUTHORS}?locale=${locale}` +
          `&pagination[page]=${currentPage}&pagination[pageSize]=100` +
          `&populate[localizations][fields][0]=slug` +
          `&populate[localizations][fields][1]=locale`
      );

      const items = response?.data ?? [];
      slugs.push(
        ...items.map((item) => ({
          slug: item.slug,
          localizations: item.localizations,
        }))
      );
      pageCount = response?.meta?.pagination?.pageCount ?? 0;
      currentPage++;
    } catch (error) {
      logger.warn(
        `Blog: failed to fetch author slugs page ${currentPage} for ${locale}: ${String(error)}`
      );
      break;
    }
  } while (currentPage <= pageCount);

  return slugs;
};
