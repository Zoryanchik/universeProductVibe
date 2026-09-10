import type { components } from "@/shared/api/cms/cms-schema";
import type { ELanguages } from "@/shared/constants/languages";
import { fetchLocales } from "@/shared/api/fetchers";

import { fetchLoginPage } from "./fetch-login-page";

type LogInData = components["schemas"]["LogIn"];
type LocalesData = components["schemas"]["DataLocaleListResponse"]["data"];

export interface ILoginPageData {
  readonly pageData: LogInData | undefined;
  readonly localesData: LocalesData | undefined;
}

export const fetchLoginPageData = async (
  locale: ELanguages
): Promise<ILoginPageData> => {
  const [pageData, localesData] = await Promise.all([
    fetchLoginPage(locale),
    fetchLocales(),
  ]);

  return {
    pageData,
    localesData,
  };
};
