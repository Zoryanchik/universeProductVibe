import { defaultLocale, availableLocales } from "@/shared/config/locale";
import type { ELanguages } from "@/shared/constants/languages";

import { fetchAllArticleSlugs } from "../fetch-blog-articles";
import {
  isReservedBlogSlug,
  validateArticleSlugs,
} from "../../model/validate-slugs";

const BUILD_LOCALE = process.env.BUILD_LOCALE as ELanguages | undefined;

const localesToBuild = (): ReadonlyArray<ELanguages> => {
  if (BUILD_LOCALE) return [BUILD_LOCALE];

  return availableLocales;
};

interface ArticlePath {
  params: { slug: string };
  props: {
    locale: ELanguages;
    slug: string;
    localeSlugMap: Record<string, string>;
  };
}

const buildLocaleSlugMap = (
  defaultSlug: string,
  defaultLoc: ELanguages,
  localizations: ReadonlyArray<{ slug: string; locale: string }> | undefined
): Record<string, string> => {
  const map: Record<string, string> = { [defaultLoc]: defaultSlug };
  for (const loc of localizations ?? []) {
    if (loc.slug && loc.locale) {
      map[loc.locale] = loc.slug.replace(/^\//, "");
    }
  }

  return map;
};

export const getBlogArticleStaticPaths = async (): Promise<ArticlePath[]> => {
  const locales = localesToBuild().filter((loc) => loc === defaultLocale);
  if (locales.length === 0) return [];

  const items = await fetchAllArticleSlugs(defaultLocale);
  const slugs = items
    .map((item) => item.slug.replace(/^\//, ""))
    .filter((slug) => !isReservedBlogSlug(slug));
  validateArticleSlugs(slugs);

  return items
    .map((item) => {
      const slug = item.slug.replace(/^\//, "");
      if (isReservedBlogSlug(slug)) return null;

      const localeSlugMap = buildLocaleSlugMap(
        slug,
        defaultLocale,
        item.localizations
      );

      return {
        params: { slug },
        props: { locale: defaultLocale, slug, localeSlugMap },
      };
    })
    .filter((x): x is ArticlePath => x !== null);
};
