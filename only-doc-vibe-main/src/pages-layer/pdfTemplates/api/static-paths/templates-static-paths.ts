import { defaultLocale } from "@/shared/config/locale";

import { extraPageNumbers, walkTemplateTree } from "../../lib/template-tree";
import { fetchTemplateCategories } from "../fetch-template-categories";
import { fetchTemplateIndex } from "../fetch-template-index";

/** Templates are English-only, so they always build from the default locale. */
const loadTree = async () =>
  walkTemplateTree(
    ...(await Promise.all([
      fetchTemplateIndex(defaultLocale),
      fetchTemplateCategories(defaultLocale),
    ]))
  );

export const getCatalogPagedStaticPaths = async () => {
  const { catalog } = await loadTree();

  return extraPageNumbers(catalog.pageCount).map((page) => ({
    params: { n: String(page) },
    props: { page },
  }));
};

export const getCategoryStaticPaths = async () => {
  const { categories } = await loadTree();

  return categories.map(({ categorySlug }) => ({
    params: { category: categorySlug },
    props: { categorySlug },
  }));
};

export const getCategoryPagedStaticPaths = async () => {
  const { categories } = await loadTree();

  return categories.flatMap(({ categorySlug, pageCount }) =>
    extraPageNumbers(pageCount).map((page) => ({
      params: { category: categorySlug, n: String(page) },
      props: { categorySlug, page },
    }))
  );
};

export const getCategoryChildStaticPaths = async () => {
  const { subcategories, templates } = await loadTree();

  return [
    ...subcategories.map(({ categorySlug, subcategorySlug }) => ({
      params: { category: categorySlug, slug: subcategorySlug },
      props: { kind: "subcategory" as const, categorySlug, subcategorySlug },
    })),
    ...templates.map(({ categorySlug, slug }) => ({
      params: { category: categorySlug, slug },
      props: { kind: "template" as const, categorySlug, templateSlug: slug },
    })),
  ];
};

export const getSubcategoryPagedStaticPaths = async () => {
  const { subcategories } = await loadTree();

  return subcategories.flatMap(({ categorySlug, subcategorySlug, pageCount }) =>
    extraPageNumbers(pageCount).map((page) => ({
      params: {
        category: categorySlug,
        slug: subcategorySlug,
        n: String(page),
      },
      props: { categorySlug, subcategorySlug, page },
    }))
  );
};
