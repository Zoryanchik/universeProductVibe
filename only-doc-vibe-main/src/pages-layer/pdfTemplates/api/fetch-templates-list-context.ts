import type { components } from "@/shared/api/cms/cms-schema";
import { fetchFooter, fetchNavbar } from "@/shared/api/fetchers";
import type { ELanguages } from "@/shared/constants/languages";

import { buildCategoryNav, buildSearchIndex } from "../lib/derive-listings";
import type {
  ITemplateCategoryNav,
  ITemplateSearchEntry,
} from "../model/types";
import {
  fetchTemplateIndex,
  type ITemplateIndexEntry,
} from "./fetch-template-index";
import { fetchTemplateCategories } from "./fetch-template-categories";

type NavbarData = components["schemas"]["NavbarResponse"]["data"];
type FooterData = components["schemas"]["FooterResponse"]["data"];

export interface ITemplatesListContext {
  readonly index: ReadonlyArray<ITemplateIndexEntry>;
  readonly categoryNav: ReadonlyArray<ITemplateCategoryNav>;
  readonly searchIndex: ReadonlyArray<ITemplateSearchEntry>;
  readonly navbarData: NavbarData | undefined;
  readonly footerData: FooterData | undefined;
}

/**
 * Shared context for catalog / category / subcategory pages: the full template
 * index (for grids, counts, search) + sidebar nav + navbar/footer.
 */
export const fetchTemplatesListContext = async (
  locale: ELanguages
): Promise<ITemplatesListContext> => {
  const [indexResult, categoriesResult, navbarResult, footerResult] =
    await Promise.allSettled([
      fetchTemplateIndex(locale),
      fetchTemplateCategories(locale),
      fetchNavbar(locale),
      fetchFooter(locale),
    ]);

  const index = indexResult.status === "fulfilled" ? indexResult.value : [];
  const categories =
    categoriesResult.status === "fulfilled" ? categoriesResult.value : [];

  return {
    index,
    categoryNav: buildCategoryNav(categories, index),
    searchIndex: buildSearchIndex(index),
    navbarData:
      navbarResult.status === "fulfilled" ? navbarResult.value : undefined,
    footerData:
      footerResult.status === "fulfilled" ? footerResult.value : undefined,
  };
};
