import { WEB_HOST } from "astro:env/client";

import { defaultLocale } from "../../config/locale";
import {
  ELanguages,
  type ELanguages as ELanguagesType,
} from "../../constants/languages";
import type { HreflangItem } from "../../types/seo/meta";

/**
 * Extract the clean path from a pathname by removing language prefix if present
 * Examples:
 * - "/edit-pdf" -> "edit-pdf"
 * - "/fr/edit-pdf" -> "edit-pdf"
 * - "/" -> ""
 * - "/fr" -> ""
 */
function getCleanPath(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  const parts = path.split("/").filter(Boolean);

  // If first part is a language code, return the rest
  if (
    parts.length > 0 &&
    Object.values(ELanguages).includes(parts[0] as ELanguagesType)
  ) {
    return parts.slice(1).join("/");
  }

  return path;
}

/**
 * Build URL for a specific language
 * For service pages, add language prefix for non-default locales
 * For other pages, add language prefix for non-default locales
 */
function buildUrlForLanguage(
  cleanPath: string,
  language: ELanguagesType,
  baseUrl: string
): string {
  // For default locale (English), never add language prefix
  if (language === defaultLocale) {
    return cleanPath ? `${baseUrl}/${cleanPath}` : `${baseUrl}/`;
  }

  // For non-default locales, always add language prefix
  return cleanPath
    ? `${baseUrl}/${language}/${cleanPath}`
    : `${baseUrl}/${language}`;
}

/**
 * Generate hreflang attributes from a locale→slug map.
 * Each entry produces a correctly prefixed URL for its locale.
 * Use this for pages where each locale has its own localized slug.
 *
 * @param localeSlugMap - e.g. { en: "blog/my-article", fr: "blog/mon-article" }
 */
export function getHreflangsFromSlugMap(
  localeSlugMap: Record<string, string>
): { hreflangs: HreflangItem[] } {
  const baseUrl = `https://${WEB_HOST}`;

  const hreflangs: HreflangItem[] = Object.entries(localeSlugMap).map(
    ([locale, slug]) => ({
      lang: locale as ELanguagesType,
      url: buildUrlForLanguage(slug, locale as ELanguagesType, baseUrl),
    })
  );

  const enSlug = localeSlugMap[defaultLocale];

  if (enSlug !== undefined) {
    hreflangs.push({
      lang: "x-default",
      url: buildUrlForLanguage(enSlug, defaultLocale, baseUrl),
    });
  }

  return { hreflangs };
}

/**
 * Generate hreflang attributes for SEO
 * @param locales - Array of available locales
 * @param pathname - Current pathname (e.g., "/edit-pdf", "/fr/edit-pdf", "/")
 * @returns Array of hreflang objects with lang and url properties (including x-default)
 */
export function getHreflangs(
  locales: ELanguagesType[],
  pathname: string = "/"
): { hreflangs: HreflangItem[] } {
  const baseUrl = `https://${WEB_HOST}`;
  const cleanPath = getCleanPath(pathname);

  // Generate hreflangs for each locale
  const hreflangs: HreflangItem[] = locales.map((locale) => ({
    lang: locale,
    url: buildUrlForLanguage(cleanPath, locale, baseUrl),
  }));

  // Add x-default (always points to default locale version)
  const xDefaultUrl = buildUrlForLanguage(cleanPath, defaultLocale, baseUrl);
  hreflangs.push({
    lang: "x-default",
    url: xDefaultUrl,
  });

  return { hreflangs };
}
