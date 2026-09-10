import type { components } from "@/shared/api/cms/cms-schema";
import type { ELanguages } from "@/shared/constants/languages";
import { fetchFooter, fetchLocales, fetchNavbar } from "@/shared/api/fetchers";

import { fetchAboutUsPage } from "./fetch-about-us-page";

type AboutUsData = components["schemas"]["AboutUs"];
type NavbarData = components["schemas"]["NavbarResponse"]["data"];
type FooterData = components["schemas"]["FooterListResponse"]["data"][0];
type LocalesData = components["schemas"]["DataLocaleListResponse"]["data"];

export interface IAboutUsPageData {
  readonly pageData: AboutUsData | undefined;
  readonly navbarData: NavbarData | undefined;
  readonly footerData: FooterData | undefined;
  readonly localesData: LocalesData | undefined;
}

export const fetchAboutUsPageData = async (
  locale: ELanguages
): Promise<IAboutUsPageData> => {
  const [pageData, navbarData, footerData, localesData] = await Promise.all([
    fetchAboutUsPage(locale),
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
