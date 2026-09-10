import type { ELanguages } from "@/shared/constants/languages";
import { fetchFooter, fetchNavbar } from "@/shared/api/fetchers";
import type { components } from "@/shared/api/cms/cms-schema";
import type { IBlogArticle, IBlogCategory } from "@/shared/types/blog";

import { ARTICLES_PER_PAGE } from "../model/constants";
import { fetchBlogArticles } from "./fetch-blog-articles";
import {
  fetchBlogCategoriesSplit,
  findCategoryBySlug,
} from "./fetch-blog-categories";

type NavbarData = components["schemas"]["NavbarResponse"]["data"];
type FooterData = components["schemas"]["FooterResponse"]["data"];

export interface IBlogListPageData {
  readonly categories: ReadonlyArray<IBlogCategory>;
  /** The reserved `all` CMS category — provides title/description/SEO/CTA for /blog. */
  readonly allCategory: IBlogCategory | undefined;
  readonly category: IBlogCategory | undefined;
  readonly articles: ReadonlyArray<IBlogArticle>;
  readonly page: number;
  readonly pageCount: number;
  readonly totalArticles: number;
  readonly navbarData: NavbarData | undefined;
  readonly footerData: FooterData | undefined;
}

export interface FetchBlogListDataArgs {
  readonly locale: ELanguages;
  readonly page: number;
  readonly categorySlug?: string;
}

export const fetchBlogListPageData = async ({
  locale,
  page,
  categorySlug,
}: FetchBlogListDataArgs): Promise<IBlogListPageData> => {
  const [categoriesResult, navbarResult, footerResult] =
    await Promise.allSettled([
      fetchBlogCategoriesSplit(locale),
      fetchNavbar(locale),
      fetchFooter(locale),
    ]);

  const { categories, allCategory } =
    categoriesResult.status === "fulfilled"
      ? categoriesResult.value
      : { categories: [], allCategory: undefined };

  const navbarData =
    navbarResult.status === "fulfilled" ? navbarResult.value : undefined;
  const footerData =
    footerResult.status === "fulfilled" ? footerResult.value : undefined;

  const category = categorySlug
    ? findCategoryBySlug(categories, categorySlug)
    : undefined;

  const { articles, pageCount, total } = await fetchBlogArticles({
    locale,
    page,
    pageSize: ARTICLES_PER_PAGE,
    categorySlug: category?.slug,
  });

  return {
    categories,
    allCategory,
    category,
    articles,
    page,
    pageCount,
    totalArticles: total,
    navbarData,
    footerData,
  };
};
