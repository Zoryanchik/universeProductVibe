import { defaultLocale, availableLocales } from "@/shared/config/locale";
import type { ELanguages } from "@/shared/constants/languages";

import { fetchAllAuthorSlugs } from "../fetch-blog-author";

const BUILD_LOCALE = process.env.BUILD_LOCALE as ELanguages | undefined;

const localesToBuild = (): ReadonlyArray<ELanguages> => {
  if (BUILD_LOCALE) return [BUILD_LOCALE];

  return availableLocales;
};

interface AuthorPath {
  params: { slug: string };
  props: {
    locale: ELanguages;
    slug: string;
    localeSlugMap: Record<string, string>;
  };
}

const buildLocaleSlugMap = (
  defaultSlug: string,
  localizations: ReadonlyArray<{ slug: string; locale: string }> | undefined
): Record<string, string> => {
  const map: Record<string, string> = { [defaultLocale]: defaultSlug };
  for (const loc of localizations ?? []) {
    if (loc.slug && loc.locale) {
      map[loc.locale] = loc.slug.replace(/^\//, "");
    }
  }

  return map;
};

export const getBlogAuthorStaticPaths = async (): Promise<AuthorPath[]> => {
  const locales = localesToBuild().filter((loc) => loc === defaultLocale);
  if (locales.length === 0) return [];

  const items = await fetchAllAuthorSlugs(defaultLocale);

  return items.map((item) => {
    const slug = item.slug.replace(/^\//, "");

    return {
      params: { slug },
      props: {
        locale: defaultLocale,
        slug,
        localeSlugMap: buildLocaleSlugMap(slug, item.localizations),
      },
    };
  });
};
