import { TEMPLATES_PER_PAGE } from "../model/constants";
import type { ITemplateIndexEntry } from "../api/fetch-template-index";
import type { IRawTemplateCategory } from "../api/fetch-template-categories";
import type {
  ITemplateCard,
  ITemplateCategoryNav,
  ITemplateListResult,
  ITemplateSearchEntry,
} from "../model/types";

const toCard = (entry: ITemplateIndexEntry): ITemplateCard => ({
  slug: entry.slug,
  title: entry.title,
  categoryLabel: entry.categoryLabel,
  categorySlug: entry.categorySlug,
  coverImageUrl: entry.coverImageUrl,
  coverImageAlt: entry.coverImageAlt,
});

interface ListFilter {
  readonly categorySlug?: string;
  readonly subcategorySlug?: string;
}

const filterIndex = (
  index: ReadonlyArray<ITemplateIndexEntry>,
  filter: ListFilter
): ReadonlyArray<ITemplateIndexEntry> =>
  index.filter((entry) => {
    if (filter.categorySlug && entry.categorySlug !== filter.categorySlug) {
      return false;
    }

    if (
      filter.subcategorySlug &&
      entry.subcategorySlug !== filter.subcategorySlug
    ) {
      return false;
    }

    return true;
  });

/** Paginate a filtered slice of the index into a card listing. */
export const listTemplates = (
  index: ReadonlyArray<ITemplateIndexEntry>,
  page: number,
  filter: ListFilter = {}
): ITemplateListResult => {
  const filtered = filterIndex(index, filter);
  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / TEMPLATES_PER_PAGE));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * TEMPLATES_PER_PAGE;

  return {
    templates: filtered.slice(start, start + TEMPLATES_PER_PAGE).map(toCard),
    page: safePage,
    pageCount,
    total,
  };
};

export const countPages = (
  index: ReadonlyArray<ITemplateIndexEntry>,
  filter: ListFilter = {}
): number =>
  Math.max(
    1,
    Math.ceil(filterIndex(index, filter).length / TEMPLATES_PER_PAGE)
  );

/** Combine CMS categories with index counts to build the sidebar nav. */
export const buildCategoryNav = (
  categories: ReadonlyArray<IRawTemplateCategory>,
  index: ReadonlyArray<ITemplateIndexEntry>
): ReadonlyArray<ITemplateCategoryNav> =>
  categories.map((category) => {
    const inCategory = index.filter(
      (entry) => entry.categorySlug === category.slug
    );

    return {
      slug: category.slug,
      title: category.title,
      count: inCategory.length,
      subcategories: category.subcategories.map((sub) => ({
        slug: sub.slug,
        title: sub.title,
        categorySlug: category.slug,
        count: inCategory.filter((entry) => entry.subcategorySlug === sub.slug)
          .length,
      })),
    };
  });

/** Build the lightweight client-side search index. */
export const buildSearchIndex = (
  index: ReadonlyArray<ITemplateIndexEntry>
): ReadonlyArray<ITemplateSearchEntry> =>
  index.map((entry) => ({
    slug: entry.slug,
    title: entry.title,
    categoryLabel: entry.categoryLabel,
    categorySlug: entry.categorySlug,
  }));
