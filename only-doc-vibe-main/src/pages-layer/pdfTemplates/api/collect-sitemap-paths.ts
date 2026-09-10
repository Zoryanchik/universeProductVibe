import { defaultLocale } from "@/shared/config/locale";

import { extraPageNumbers, walkTemplateTree } from "../lib/template-tree";
import {
  getCatalogUrl,
  getCategoryUrl,
  getSubcategoryUrl,
  getTemplateUrl,
  withPage,
} from "../lib/urls";
import { fetchTemplateCategories } from "./fetch-template-categories";
import { fetchTemplateIndex } from "./fetch-template-index";

/**
 * Collect all indexable PDF-template URLs for the sitemap: catalog + category
 * + subcategory listings (incl. pagination) + individual template pages. The
 * `/editor` route is intentionally excluded (noindex).
 */
export const collectTemplateSitemapPaths = async (): Promise<string[]> => {
  const tree = walkTemplateTree(
    ...(await Promise.all([
      fetchTemplateIndex(defaultLocale),
      fetchTemplateCategories(defaultLocale),
    ]))
  );

  const paths = new Set<string>();

  const addListing = (baseUrl: string, pageCount: number): void => {
    paths.add(baseUrl);
    for (const page of extraPageNumbers(pageCount)) {
      paths.add(withPage(baseUrl, page));
    }
  };

  addListing(getCatalogUrl(), tree.catalog.pageCount);

  for (const { categorySlug, pageCount } of tree.categories) {
    addListing(getCategoryUrl(categorySlug), pageCount);
  }

  for (const {
    categorySlug,
    subcategorySlug,
    pageCount,
  } of tree.subcategories) {
    addListing(getSubcategoryUrl(categorySlug, subcategorySlug), pageCount);
  }

  for (const { categorySlug, slug } of tree.templates) {
    paths.add(getTemplateUrl(categorySlug, slug));
  }

  return [...paths];
};
