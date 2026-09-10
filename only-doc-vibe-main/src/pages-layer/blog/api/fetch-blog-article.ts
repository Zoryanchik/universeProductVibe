import { CMS_HOST } from "astro:env/server";

import { cmsHttpClient } from "@/shared/api/cms/cms-http-client";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";
import { normalizeBlogArticleMedia } from "@/shared/lib/blog/normalize-blog-media";
import { logger } from "@/shared/lib/utils/logger";
import type {
  IBlogArticle,
  IStrapiCollectionResponse,
} from "@/shared/types/blog";

/**
 * Fetch a single article by slug for a given locale, with author / category /
 * related-articles relations populated for rendering the article page.
 */
export const fetchBlogArticle = async (
  slug: string,
  locale: string
): Promise<IBlogArticle | undefined> => {
  const normalizedSlug = slug.replace(/^\//, "");

  try {
    const response = await cmsHttpClient.getPage<
      IStrapiCollectionResponse<IBlogArticle>
    >(
      `${STRAPI_ROUTES.BLOG_ARTICLE_PAGES}` +
        `?filters[slug][$in][0]=${normalizedSlug}` +
        `&filters[slug][$in][1]=/${normalizedSlug}` +
        `&locale=${locale}&pLevel=4`
    );

    if (response?.data?.length) {
      return normalizeBlogArticleMedia(response.data[0], CMS_HOST);
    }

    return undefined;
  } catch (error) {
    logger.warn(
      `Blog: failed to fetch article slug=${slug} locale=${locale}: ${String(error)}`
    );

    return undefined;
  }
};
