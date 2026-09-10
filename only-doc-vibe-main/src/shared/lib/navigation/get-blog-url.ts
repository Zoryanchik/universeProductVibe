import { defaultLocale } from "../../config/locale";
import type { ELanguages } from "../../constants/languages";

const stripLeadingSlash = (value: string): string => value.replace(/^\/+/, "");

const withLocalePrefix = (path: string, locale: ELanguages): string => {
  const isDefault = locale === defaultLocale;

  return isDefault
    ? `/${stripLeadingSlash(path)}`
    : `/${locale}/${stripLeadingSlash(path)}`;
};

const trimTrailing = (value: string): string =>
  value.length > 1 ? value.replace(/\/+$/, "") : value;

/** `/` (default locale) or `/<lang>`. */
export const getLocaleHomeUrl = (locale: ELanguages): string =>
  locale === defaultLocale ? "/" : `/${locale}`;

/** `/blog` (default locale) or `/<lang>/blog`. Page 1 has no `/page/N`. */
export const getBlogHomeUrl = (
  locale: ELanguages,
  page: number = 1
): string => {
  const base = withLocalePrefix("blog", locale);

  return page > 1 ? trimTrailing(`${base}/page/${page}`) : trimTrailing(base);
};

/** `/blog/<category>` or paginated. */
export const getBlogCategoryUrl = (
  locale: ELanguages,
  categorySlug: string,
  page: number = 1
): string => {
  const base = withLocalePrefix(
    `blog/${stripLeadingSlash(categorySlug)}`,
    locale
  );

  return page > 1 ? trimTrailing(`${base}/page/${page}`) : trimTrailing(base);
};

/** `/blog/<slug>` — flat URL, no category subfolder. */
export const getBlogArticleUrl = (
  locale: ELanguages,
  articleSlug: string
): string =>
  trimTrailing(
    withLocalePrefix(`blog/${stripLeadingSlash(articleSlug)}`, locale)
  );

/** `/blog/author/<slug>`. */
export const getBlogAuthorUrl = (
  locale: ELanguages,
  authorSlug: string
): string =>
  trimTrailing(
    withLocalePrefix(`blog/author/${stripLeadingSlash(authorSlug)}`, locale)
  );
