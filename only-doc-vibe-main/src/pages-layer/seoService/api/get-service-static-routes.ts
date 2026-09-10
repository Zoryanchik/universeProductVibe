import { getAllServiceRoutes } from "./fetch-all-service-routes";

const BUILD_LOCALE = process.env.BUILD_LOCALE;

// Function to generate service page routes for default locale
export async function getServicePages() {
  const serviceRoutes = await getAllServiceRoutes();

  return serviceRoutes
    .filter((route) => {
      if (!route.isDefault) return false;

      if (BUILD_LOCALE) return route.locale === BUILD_LOCALE;

      return true;
    })
    .map((route) => ({
      params: { service: route.slug },
    }));
}

// Function to generate localized service page routes
// Routes are sorted by locale to ensure pages are built language-by-language
export async function getLocalizedServicePages() {
  const serviceRoutes = await getAllServiceRoutes();

  return serviceRoutes
    .filter((route) => {
      if (route.isDefault) return false;

      // Filter by BUILD_LOCALE if set, otherwise build all locales
      if (BUILD_LOCALE) return route.locale === BUILD_LOCALE;

      return true;
    })
    .sort((a, b) => {
      // Sort by locale first, then by slug
      if (a.locale === b.locale) {
        return (a.slug || "").localeCompare(b.slug || "");
      }

      return (a.locale || "").localeCompare(b.locale || "");
    })
    .map((route) => ({
      params: {
        lang: route.locale,
        service: route.slug,
      },
    }));
}
