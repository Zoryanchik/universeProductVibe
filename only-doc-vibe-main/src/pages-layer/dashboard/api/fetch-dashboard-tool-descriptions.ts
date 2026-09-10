import type { components } from "@/shared/api/cms/cms-schema";
import { getAllRoutes } from "@/shared/api/cms/cms-http-client";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";
import { logger } from "@/shared/lib/utils/logger";

type ServicePage = components["schemas"]["ServicePage"];
type ServiceHeroSection = components["schemas"]["SectionsServiceHeroComponent"];

interface ServiceRouteRef {
  readonly slug: string;
  readonly isDefault: boolean;
}

export type DashboardToolDescriptionMap = Readonly<Record<string, string>>;

const normalizeSlug = (slug: string): string =>
  slug.replace(/^\//, "").replace(/\/$/, "");

const getCanonicalSlugBySlug = (
  serviceRoutes: readonly ServiceRouteRef[]
): Map<string, string> => {
  const slugMap = new Map<string, string>();

  for (const route of serviceRoutes) {
    if (!route.isDefault) continue;

    slugMap.set(normalizeSlug(route.slug), route.slug);
  }

  return slugMap;
};

const findServiceHero = (
  sections: ServicePage["sections"] | undefined
): ServiceHeroSection | undefined =>
  sections?.find(
    (section): section is ServiceHeroSection =>
      "__component" in section &&
      section.__component === "sections.service-hero"
  );

const getFirstSentence = (description: string): string => {
  const trimmedDescription = description.trim();
  const sentenceMatch = trimmedDescription.match(/^.*?[.!?](?=\s|$)/);

  return sentenceMatch?.[0] ?? trimmedDescription;
};

/**
 * Fetches localized service-hero descriptions from the CMS and maps the first
 * sentence of each to its canonical (default-locale) tool slug. Used so the
 * dashboard tool cards show real CMS copy instead of static fallback strings.
 */
export const fetchDashboardToolDescriptions = async (
  lang: string,
  serviceRoutes: readonly ServiceRouteRef[]
): Promise<DashboardToolDescriptionMap> => {
  try {
    const pages = await getAllRoutes<ServicePage>(
      `${STRAPI_ROUTES.SERVICE_PAGES}?pagination[pageSize]=100&pLevel=6&locale=${lang}`
    );
    const canonicalSlugByLocalizedSlug = getCanonicalSlugBySlug(serviceRoutes);

    return pages.reduce<Record<string, string>>((acc, page) => {
      const canonicalSlug =
        canonicalSlugByLocalizedSlug.get(normalizeSlug(page.slug)) ??
        normalizeSlug(page.slug);
      const description = findServiceHero(page.sections)?.description;

      if (canonicalSlug && description) {
        acc[canonicalSlug] = getFirstSentence(description);
      }

      return acc;
    }, {});
  } catch (error) {
    logger.error(
      `[dashboard] Failed to fetch tool descriptions for ${lang}:`,
      error
    );

    return {};
  }
};
