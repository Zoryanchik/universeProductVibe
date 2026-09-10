import { getAllLegalRoutes } from "./fetch-all-legal-routes";

const BUILD_LOCALE = process.env.BUILD_LOCALE;

export async function getLegalPages() {
  const legalRoutes = await getAllLegalRoutes();

  return legalRoutes
    .filter((route) => {
      if (!route.isDefault) return false;

      if (BUILD_LOCALE) return route.locale === BUILD_LOCALE;

      return true;
    })
    .map((route) => ({
      params: { legal: route.slug },
    }));
}

export async function getLocalizedLegalPages() {
  const legalRoutes = await getAllLegalRoutes();

  return legalRoutes
    .filter((route) => {
      if (route.isDefault) return false;

      if (BUILD_LOCALE) return route.locale === BUILD_LOCALE;

      return true;
    })
    .sort((a, b) => {
      if (a.locale === b.locale) {
        return (a.slug || "").localeCompare(b.slug || "");
      }

      return (a.locale || "").localeCompare(b.locale || "");
    })
    .map((route) => ({
      params: {
        lang: route.locale,
        legal: route.slug,
      },
    }));
}
