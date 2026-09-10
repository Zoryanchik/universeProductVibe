import type { components } from "@/shared/api/cms/cms-schema";
import { getAllRoutes } from "@/shared/api/cms/cms-http-client";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";
import { defaultLocale } from "@/shared/config/locale";

type LegalPage = components["schemas"]["LegalPage"];

export interface LegalRoute {
  locale: string;
  slug: string;
  isDefault: boolean;
  localeSlugMap: Record<string, string>;
}

export async function getAllLegalRoutes(): Promise<LegalRoute[]> {
  try {
    const allLegalPages = await getAllRoutes<LegalPage>(
      `${STRAPI_ROUTES.LEGAL_PAGES}?pagination[pageSize]=100` +
        `&populate[localizations][fields][0]=slug` +
        `&populate[localizations][fields][1]=locale`
    );

    const routes: LegalRoute[] = [];

    for (const page of allLegalPages) {
      if (page.locale !== defaultLocale) continue;

      const englishSlug = page.slug.replace(/^\//, "");

      const localeSlugMap: Record<string, string> = {
        [defaultLocale]: englishSlug,
      };

      for (const loc of page.localizations ?? []) {
        if (loc.slug && loc.locale) {
          localeSlugMap[loc.locale] = loc.slug.replace(/^\//, "");
        }
      }

      routes.push({
        locale: page.locale,
        slug: englishSlug,
        isDefault: true,
        localeSlugMap,
      });

      for (const loc of page.localizations ?? []) {
        if (!loc.slug || !loc.locale) continue;

        routes.push({
          locale: loc.locale,
          slug: loc.slug.replace(/^\//, ""),
          isDefault: false,
          localeSlugMap,
        });
      }
    }

    return routes;
  } catch (error) {
    console.error("Failed to fetch legal routes:", error);

    return [];
  }
}
