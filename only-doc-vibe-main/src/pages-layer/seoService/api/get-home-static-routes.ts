import { defaultLocale } from "@/shared/config/locale";
import type { ELanguages } from "@/shared/constants/languages";

export function getMainPages(locales: ELanguages[]) {
  return locales.map((locale) => ({
    params: { lang: locale },
  }));
}

// Function to generate localized main page routes (excluding default locale)
export function getLocalizedMainPages(locales: ELanguages[]) {
  return locales
    .filter((locale) => locale !== defaultLocale)
    .map((locale) => ({
      params: { lang: locale },
    }));
}
