import type { components } from "@/shared/api/cms/cms-schema";
import type { ELanguages } from "@/shared/constants/languages";
import { fetchFooter, fetchLocales, fetchNavbar } from "@/shared/api/fetchers";

import { fetchServicePage } from "./fetch-service-page";

type ServicePage = components["schemas"]["ServicePage"];
type NavbarData = components["schemas"]["NavbarResponse"]["data"];
type FooterData = components["schemas"]["FooterListResponse"]["data"][0];
type LocalesData = components["schemas"]["DataLocaleListResponse"]["data"];

export interface IServicePageData {
  readonly pageData: ServicePage | null;
  readonly navbarData: NavbarData | undefined;
  readonly footerData: FooterData | undefined;
  readonly localesData: LocalesData | undefined;
}

export const fetchServicePageData = async (
  service: string,
  locale: ELanguages
): Promise<IServicePageData> => {
  const [pageData, navbarData, footerData, localesData] = await Promise.all([
    fetchServicePage(service, locale),
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
