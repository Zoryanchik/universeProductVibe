import type { components } from "@/shared/api/cms/cms-schema";
import type { ELanguages } from "@/shared/constants/languages";
import { fetchFooter, fetchLocales, fetchNavbar } from "@/shared/api/fetchers";

import { fetchContactUsPage } from "./fetch-contact-us-page";

type ContactUsData = components["schemas"]["ContactUs"];
type NavbarData = components["schemas"]["NavbarResponse"]["data"];
type FooterData = components["schemas"]["FooterListResponse"]["data"][0];
type LocalesData = components["schemas"]["DataLocaleListResponse"]["data"];

export interface IContactUsPageData {
  readonly pageData: ContactUsData | undefined;
  readonly navbarData: NavbarData | undefined;
  readonly footerData: FooterData | undefined;
  readonly localesData: LocalesData | undefined;
}

export const fetchContactUsPageData = async (
  locale: ELanguages
): Promise<IContactUsPageData> => {
  const [pageData, navbarData, footerData, localesData] = await Promise.all([
    fetchContactUsPage(locale),
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
