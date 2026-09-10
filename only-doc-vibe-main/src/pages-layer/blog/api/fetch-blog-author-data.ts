import type { ELanguages } from "@/shared/constants/languages";
import type { components } from "@/shared/api/cms/cms-schema";
import { fetchFooter, fetchNavbar } from "@/shared/api/fetchers";
import type {
  IBlogArticle,
  IBlogAuthor,
  IBlogCategory,
} from "@/shared/types/blog";

import { ARTICLES_PER_PAGE } from "../model/constants";
import { fetchBlogArticles } from "./fetch-blog-articles";
import { fetchBlogAuthor } from "./fetch-blog-author";
import { fetchBlogCategoriesSplit } from "./fetch-blog-categories";

type NavbarData = components["schemas"]["NavbarResponse"]["data"];
type FooterData = components["schemas"]["FooterResponse"]["data"];

export interface IBlogAuthorPageData {
  readonly author: IBlogAuthor | undefined;
  /** Fallback CTA from the reserved `all` blog category when author has none. */
  readonly allCategory: IBlogCategory | undefined;
  readonly articles: ReadonlyArray<IBlogArticle>;
  readonly navbarData: NavbarData | undefined;
  readonly footerData: FooterData | undefined;
}

export const fetchBlogAuthorPageData = async (
  slug: string,
  locale: ELanguages
): Promise<IBlogAuthorPageData> => {
  const [authorResult, categoriesResult, navbarResult, footerResult] =
    await Promise.allSettled([
      fetchBlogAuthor(slug, locale),
      fetchBlogCategoriesSplit(locale),
      fetchNavbar(locale),
      fetchFooter(locale),
    ]);

  const author =
    authorResult.status === "fulfilled" ? authorResult.value : undefined;
  const allCategory =
    categoriesResult.status === "fulfilled"
      ? categoriesResult.value.allCategory
      : undefined;
  const navbarData =
    navbarResult.status === "fulfilled" ? navbarResult.value : undefined;
  const footerData =
    footerResult.status === "fulfilled" ? footerResult.value : undefined;

  let articles: ReadonlyArray<IBlogArticle> = [];
  if (author) {
    const result = await fetchBlogArticles({
      locale,
      page: 1,
      pageSize: ARTICLES_PER_PAGE,
      authorSlug: author.slug,
    });
    articles = result.articles;
  }

  return { author, allCategory, articles, navbarData, footerData };
};
