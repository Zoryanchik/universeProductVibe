import { defaultLocale, availableLocales } from "@/shared/config/locale";
import type { ELanguages } from "@/shared/constants/languages";

import { ARTICLES_PER_PAGE } from "../../model/constants";
import { fetchBlogArticles } from "../fetch-blog-articles";
import { fetchBlogCategories } from "../fetch-blog-categories";

const BUILD_LOCALE = process.env.BUILD_LOCALE as ELanguages | undefined;

const localesToBuild = (): ReadonlyArray<ELanguages> => {
  if (BUILD_LOCALE) return [BUILD_LOCALE];

  return availableLocales;
};

interface ListPath {
  params: { n?: string };
  props: { locale: ELanguages; page: number };
}

interface CategoryPath {
  params: { category: string; n?: string };
  props: { locale: ELanguages; page: number; categorySlug: string };
}

const computePagesForLocale = async (
  locale: ELanguages,
  categorySlug?: string
): Promise<number> => {
  const result = await fetchBlogArticles({
    locale,
    page: 1,
    pageSize: ARTICLES_PER_PAGE,
    categorySlug,
  });

  return Math.max(1, result.pageCount);
};

/* ----------------------- Default-locale list paths ---------------------- */

export const getBlogListStaticPaths = async (): Promise<ListPath[]> => {
  const locales = localesToBuild().filter((loc) => loc === defaultLocale);
  if (locales.length === 0) return [];

  return [
    { params: { n: undefined }, props: { locale: defaultLocale, page: 1 } },
  ];
};

export const getBlogListPagedStaticPaths = async (): Promise<ListPath[]> => {
  const locales = localesToBuild().filter((loc) => loc === defaultLocale);
  if (locales.length === 0) return [];

  const pageCount = await computePagesForLocale(defaultLocale);
  const paths: ListPath[] = [];
  for (let p = 2; p <= pageCount; p++) {
    paths.push({
      params: { n: String(p) },
      props: { locale: defaultLocale, page: p },
    });
  }

  return paths;
};

/* ----------------------- Category paths (default) ----------------------- */

export const getBlogCategoryStaticPaths = async (): Promise<CategoryPath[]> => {
  const locales = localesToBuild().filter((loc) => loc === defaultLocale);
  if (locales.length === 0) return [];

  const categories = await fetchBlogCategories(defaultLocale);

  return categories.map((category) => ({
    params: { category: category.slug.replace(/^\//, ""), n: undefined },
    props: {
      locale: defaultLocale,
      page: 1,
      categorySlug: category.slug.replace(/^\//, ""),
    },
  }));
};

export const getBlogCategoryPagedStaticPaths = async (): Promise<
  CategoryPath[]
> => {
  const locales = localesToBuild().filter((loc) => loc === defaultLocale);
  if (locales.length === 0) return [];

  const categories = await fetchBlogCategories(defaultLocale);

  const categoryPageCounts = await Promise.all(
    categories.map(async (category) => {
      const slug = category.slug.replace(/^\//, "");
      const pageCount = await computePagesForLocale(defaultLocale, slug);

      return { slug, pageCount };
    })
  );

  const paths: CategoryPath[] = [];
  for (const { slug, pageCount } of categoryPageCounts) {
    for (let p = 2; p <= pageCount; p++) {
      paths.push({
        params: { category: slug, n: String(p) },
        props: { locale: defaultLocale, page: p, categorySlug: slug },
      });
    }
  }

  return paths;
};
