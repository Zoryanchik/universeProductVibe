import { availableLocales, defaultLocale } from "@/shared/config/locale";

const BUILD_LOCALE = process.env.BUILD_LOCALE;

export async function getLocalizedLoginPages() {
  return availableLocales
    .filter((locale) => {
      if (locale === defaultLocale) return false;

      if (BUILD_LOCALE) return locale === BUILD_LOCALE;

      return true;
    })
    .map((locale) => ({
      params: { lang: locale },
    }));
}
