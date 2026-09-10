import type { components } from "@/shared/api/cms/cms-schema";
import type { ELanguages } from "@/shared/constants/languages";
import { fetchLocales } from "@/shared/api/fetchers";

import { fetchSignUpPage } from "./fetch-sign-up-page";

type SignUpData = components["schemas"]["SignUp"];
type LocalesData = components["schemas"]["DataLocaleListResponse"]["data"];

export interface ISignUpPageData {
  readonly pageData: SignUpData | undefined;
  readonly localesData: LocalesData | undefined;
}

export const fetchSignUpPageData = async (
  locale: ELanguages
): Promise<ISignUpPageData> => {
  const [pageData, localesData] = await Promise.all([
    fetchSignUpPage(locale),
    fetchLocales(),
  ]);

  return {
    pageData,
    localesData,
  };
};
