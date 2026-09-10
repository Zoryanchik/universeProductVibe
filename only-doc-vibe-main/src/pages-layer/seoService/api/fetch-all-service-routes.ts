import type { components } from "@/shared/api/cms/cms-schema";
import { getAllRoutes } from "@/shared/api/cms/cms-http-client";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";
import { availableLocales, defaultLocale } from "@/shared/config/locale";

type ServicePage = components["schemas"]["ServicePage"];

export async function getAllServiceRoutes() {
  try {
    const perLocaleResults = await Promise.all(
      availableLocales.map(async (locale) => {
        const pages = await getAllRoutes<ServicePage>(
          `${STRAPI_ROUTES.SERVICE_PAGES}?pLevel=6&pagination[pageSize]=100&locale=${locale}`
        );

        return pages.map((page) => {
          const pageLocale = page.locale ?? locale;

          return {
            locale: pageLocale,
            slug: page.slug.replace(/^\//, ""),
            isDefault: pageLocale === defaultLocale,
            updatedAt: page.updatedAt,
            publishedAt: page.publishedAt,
          };
        });
      })
    );

    return perLocaleResults.flat();
  } catch (error) {
    console.error("Failed to fetch service routes:", error);

    return [];
  }
}
