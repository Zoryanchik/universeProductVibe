import type { components } from "@/shared/api/cms/cms-schema";
import type { ELanguages } from "@/shared/constants/languages";
import { fetchFooter, fetchLocales, fetchNavbar } from "@/shared/api/fetchers";

import { fetchMainPage } from "./fetch-main-page";

type MainPageData = components["schemas"]["MainPage"];
type NavbarData = components["schemas"]["NavbarResponse"]["data"];
type FooterData = components["schemas"]["FooterListResponse"]["data"][0];
type LocalesData = components["schemas"]["DataLocaleListResponse"]["data"];

export interface IHomePageData {
  readonly pageData: MainPageData | undefined;
  readonly navbarData: NavbarData | undefined;
  readonly footerData: FooterData | undefined;
  readonly localesData: LocalesData | undefined;
}

export const fetchHomePageData = async (
  locale: ELanguages
): Promise<IHomePageData> => {
  const [pageData, navbarData, footerData, localesData] = await Promise.all([
    fetchMainPage(locale),
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
