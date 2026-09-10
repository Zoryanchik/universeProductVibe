import type { IRawTemplateCategory } from "../api/fetch-template-categories";
import type { ITemplateIndexEntry } from "../api/fetch-template-index";
import { countPages } from "./derive-listings";

interface IListingNode {
  readonly categorySlug: string;
  readonly pageCount: number;
}

interface ISubcategoryNode extends IListingNode {
  readonly subcategorySlug: string;
}

interface ILeafNode {
  readonly categorySlug: string;
  readonly slug: string;
}

/**
 * The full PDF-templates routing tree walked once: the catalog, every category
 * and subcategory listing (with pagination counts) and every individual
 * template. Both the static-path generation and the sitemap derive their URLs
 * from this single traversal.
 */
export interface ITemplateTree {
  readonly catalog: { readonly pageCount: number };
  readonly categories: ReadonlyArray<IListingNode>;
  readonly subcategories: ReadonlyArray<ISubcategoryNode>;
  readonly templates: ReadonlyArray<ILeafNode>;
}

const reservedSubcategorySlugs = (
  categories: ReadonlyArray<IRawTemplateCategory>
): Map<string, ReadonlySet<string>> =>
  new Map(
    categories.map((category) => [
      category.slug,
      new Set(category.subcategories.map((sub) => sub.slug)),
    ])
  );

export const walkTemplateTree = (
  index: ReadonlyArray<ITemplateIndexEntry>,
  categories: ReadonlyArray<IRawTemplateCategory>
): ITemplateTree => {
  const categoryNodes: IListingNode[] = [];
  const subcategoryNodes: ISubcategoryNode[] = [];

  for (const category of categories) {
    categoryNodes.push({
      categorySlug: category.slug,
      pageCount: countPages(index, { categorySlug: category.slug }),
    });

    for (const sub of category.subcategories) {
      subcategoryNodes.push({
        categorySlug: category.slug,
        subcategorySlug: sub.slug,
        pageCount: countPages(index, {
          categorySlug: category.slug,
          subcategorySlug: sub.slug,
        }),
      });
    }
  }

  const reserved = reservedSubcategorySlugs(categories);
  const templates: ILeafNode[] = index
    .filter((entry) => !reserved.get(entry.categorySlug)?.has(entry.slug))
    .map((entry) => ({ categorySlug: entry.categorySlug, slug: entry.slug }));

  return {
    catalog: { pageCount: countPages(index) },
    categories: categoryNodes,
    subcategories: subcategoryNodes,
    templates,
  };
};

/** Pagination page numbers beyond page 1 (`[2, 3, …, pageCount]`). */
export const extraPageNumbers = (pageCount: number): number[] =>
  Array.from({ length: Math.max(0, pageCount - 1) }, (_, i) => i + 2);
