import type { components } from "@/shared/api/cms/cms-schema";
import type { ELanguages } from "@/shared/constants/languages";
import { fetchFooter, fetchLocales, fetchNavbar } from "@/shared/api/fetchers";

import { fetchLegalPage } from "./fetch-legal-page";

type LegalPageData = components["schemas"]["LegalPage"];
type NavbarData = components["schemas"]["NavbarResponse"]["data"];
type FooterData = components["schemas"]["FooterListResponse"]["data"][0];
type LocalesData = components["schemas"]["DataLocaleListResponse"]["data"];

export interface ILegalPageData {
  readonly pageData: LegalPageData | undefined;
  readonly navbarData: NavbarData | undefined;
  readonly footerData: FooterData | undefined;
  readonly localesData: LocalesData | undefined;
}

export const fetchLegalPageData = async (
  slug: string,
  locale: ELanguages
): Promise<ILegalPageData> => {
  const [pageData, navbarData, footerData, localesData] = await Promise.all([
    fetchLegalPage(slug, locale),
    fetchNavbar(locale),
    fetchFooter(locale),
    fetchLocales(),
  ]);

  return {
    pageData,
    navbarData,
    footerData,
    localesData,
  };
};
