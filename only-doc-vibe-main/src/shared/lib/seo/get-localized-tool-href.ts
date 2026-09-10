import { navigateThroughURL } from "./navigate-through-url";

export type LocaleSlugMap = Record<string, string>;

export function getLocalizedToolHref(
  path: string,
  lang: string,
  slugMap?: LocaleSlugMap
): string {
  if (/^https?:\/\//i.test(path)) return navigateThroughURL(path, lang);

  const [rawSlug, ...rest] = path.replace(/^\//, "").split("/");
  const suffix = rest.length > 0 ? `/${rest.join("/")}` : "";
  const localizedSlug = slugMap?.[rawSlug] ?? rawSlug;

  return navigateThroughURL(`/${localizedSlug}${suffix}`, lang);
}

interface SlugRoute {
  slug: string;
  isDefault: boolean;
  localeSlugMap?: Record<string, string>;
}

export function buildDashboardLinkSlugs(
  lang: string,
  serviceRoutes: readonly SlugRoute[],
  legalRoutes: readonly SlugRoute[],
  contactSlugMap: Record<string, string>
): LocaleSlugMap {
  const map: LocaleSlugMap = {};

  for (const route of serviceRoutes) {
    if (!route.isDefault) continue;

    map[route.slug] = route.slug;
  }

  for (const route of legalRoutes) {
    if (!route.isDefault) continue;

    map[route.slug] = route.localeSlugMap?.[lang] ?? route.slug;
  }

  const contactSlug = contactSlugMap[lang];
  if (contactSlug) map["contact-us"] = contactSlug;

  return map;
}
