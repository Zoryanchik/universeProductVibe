import { getCmsMediaUrl } from "../cms/get-cms-media-url";
import type { IBlogArticle, IBlogAuthor, IBlogMedia } from "../../types/blog";

type SeoWithMetaImage = {
  readonly metaImage?:
    | ({ readonly url?: string | null } & Record<string, unknown>)
    | null;
};

const normalizeMedia = <T extends IBlogMedia | null | undefined>(
  media: T,
  cmsHost: string
): T => {
  if (!media?.url) return media;

  return {
    ...media,
    url: getCmsMediaUrl(media.url, cmsHost) ?? media.url,
  } as T;
};

const normalizeSeo = <T extends SeoWithMetaImage | null | undefined>(
  seo: T,
  cmsHost: string
): T => {
  if (!seo?.metaImage?.url) return seo;

  return {
    ...seo,
    metaImage: {
      ...seo.metaImage,
      url: getCmsMediaUrl(seo.metaImage.url, cmsHost),
    },
  } as T;
};

export const normalizeBlogAuthorMedia = (
  author: IBlogAuthor,
  cmsHost: string
): IBlogAuthor => ({
  ...author,
  avatar: normalizeMedia(author.avatar, cmsHost),
  seo: normalizeSeo(author.seo, cmsHost),
});

export const normalizeBlogArticleMedia = (
  article: IBlogArticle,
  cmsHost: string
): IBlogArticle => ({
  ...article,
  bg_image: normalizeMedia(article.bg_image, cmsHost),
  author: article.author
    ? normalizeBlogAuthorMedia(article.author, cmsHost)
    : article.author,
  related_articles: article.related_articles?.map(
    (relatedArticle: IBlogArticle) => ({
      ...relatedArticle,
      bg_image: normalizeMedia(relatedArticle.bg_image, cmsHost),
      author: relatedArticle.author
        ? normalizeBlogAuthorMedia(relatedArticle.author, cmsHost)
        : relatedArticle.author,
      seo: normalizeSeo(relatedArticle.seo, cmsHost),
    })
  ),
  seo: normalizeSeo(article.seo, cmsHost),
});
