import type { ELanguages } from "@/shared/constants/languages";
import type { components } from "@/shared/api/cms/cms-schema";
import { fetchFooter, fetchNavbar } from "@/shared/api/fetchers";
import type { IBlogArticle } from "@/shared/types/blog";

import { fetchBlogArticle } from "./fetch-blog-article";
import { fetchBlogArticles } from "./fetch-blog-articles";

type NavbarData = components["schemas"]["NavbarResponse"]["data"];
type FooterData = components["schemas"]["FooterResponse"]["data"];

export interface IBlogArticlePageData {
  readonly article: IBlogArticle | undefined;
  readonly relatedArticles: ReadonlyArray<IBlogArticle>;
  readonly navbarData: NavbarData | undefined;
  readonly footerData: FooterData | undefined;
}

const RELATED_FALLBACK_COUNT = 3;

export const fetchBlogArticlePageData = async (
  slug: string,
  locale: ELanguages
): Promise<IBlogArticlePageData> => {
  const [articleResult, navbarResult, footerResult] = await Promise.allSettled([
    fetchBlogArticle(slug, locale),
    fetchNavbar(locale),
    fetchFooter(locale),
  ]);

  const article =
    articleResult.status === "fulfilled" ? articleResult.value : undefined;
  const navbarData =
    navbarResult.status === "fulfilled" ? navbarResult.value : undefined;
  const footerData =
    footerResult.status === "fulfilled" ? footerResult.value : undefined;

  let relatedArticles: ReadonlyArray<IBlogArticle> = [];

  if (article) {
    if (article.related_articles && article.related_articles.length > 0) {
      relatedArticles = article.related_articles.slice(
        0,
        RELATED_FALLBACK_COUNT
      );
    } else if (article.category?.slug) {
      const fallback = await fetchBlogArticles({
        locale,
        page: 1,
        pageSize: RELATED_FALLBACK_COUNT + 1,
        categorySlug: article.category.slug,
      });
      relatedArticles = fallback.articles
        .filter((item) => item.slug !== article.slug)
        .slice(0, RELATED_FALLBACK_COUNT);
    }
  }

  return { article, relatedArticles, navbarData, footerData };
};
