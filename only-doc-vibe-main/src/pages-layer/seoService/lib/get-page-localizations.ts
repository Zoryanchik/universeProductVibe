import type { components } from "@/shared/api/cms/cms-schema";
import type { ELanguages } from "@/shared/constants/languages";
import { isELanguage } from "@/shared/constants/languages";

type ServicePage = components["schemas"]["ServicePage"];

/**
 * Build the list of locales the given service page exists in (including the
 * current locale). Used to drive the language-switcher fallback so that
 * switching to a locale without a translation lands on the locale's home
 * instead of producing a 404'ing localized URL.
 */
export const getPageLocalizations = (
  pageData: ServicePage | null | undefined,
  currentLocale: ELanguages
): ELanguages[] => {
  const fromCms = (pageData?.localizations ?? [])
    .map((localization) => localization?.locale)
    .filter(isELanguage);

  return [currentLocale, ...fromCms].filter(
    (locale, index, arr) => arr.indexOf(locale) === index
  );
};
