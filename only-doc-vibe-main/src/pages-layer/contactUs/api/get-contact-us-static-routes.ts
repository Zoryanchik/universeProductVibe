import { defaultLocale } from "@/shared/config/locale";

import { fetchContactUsSlugMap } from "./fetch-contact-us-slug-map";

const BUILD_LOCALE = process.env.BUILD_LOCALE;

export async function getLocalizedContactUsPages() {
  const localeSlugMap = await fetchContactUsSlugMap();

  return Object.entries(localeSlugMap)
    .filter(([locale]) => {
      if (locale === defaultLocale) return false;

      return BUILD_LOCALE ? locale === BUILD_LOCALE : true;
    })
    .map(([locale, slug]) => ({
      params: { lang: locale, contactUsSlug: slug },
      props: { localeSlugMap },
    }));
}
