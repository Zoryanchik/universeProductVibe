import { availableLocales, defaultLocale } from "@/shared/config/locale";
import type { ELanguages } from "@/shared/constants/languages";

const isLocale = (value: string | undefined): value is ELanguages =>
  !!value && availableLocales.includes(value as ELanguages);

/** Resolve locale from getStaticPaths props or route params (dev direct navigation). */
export const resolveBlogLocale = (
  fromProps?: ELanguages,
  paramLang?: string
): ELanguages => {
  if (fromProps && isLocale(fromProps)) return fromProps;

  if (isLocale(paramLang)) return paramLang;

  return defaultLocale;
};

export const resolveBlogPage = (
  fromProps?: number,
  paramN?: string
): number => {
  if (fromProps !== undefined && fromProps > 0) return fromProps;

  const parsed = paramN ? Number.parseInt(paramN, 10) : Number.NaN;

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

export const resolveBlogCategorySlug = (
  fromProps?: string,
  paramCategory?: string
): string | undefined => {
  const slug = fromProps ?? paramCategory;

  return slug ? slug.replace(/^\//, "") : undefined;
};

export const resolveBlogSlug = (
  fromProps?: string,
  paramSlug?: string
): string | undefined => {
  const slug = fromProps ?? paramSlug;

  return slug ? slug.replace(/^\//, "") : undefined;
};
