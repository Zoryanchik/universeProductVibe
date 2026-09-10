import { cmsHttpClient } from "@/shared/api/cms/cms-http-client";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";
import { logger } from "@/shared/lib/utils/logger";
import type { components } from "@/shared/api/cms/cms-schema";
import { createServerT } from "@/shared/lib/translations/server-t";
import { ELanguages } from "@/shared/constants/languages";

import {
  HIDDEN_TOOL_IDS,
  categorizeCmsTool,
  buildDashboardTools,
  getToolDescription,
} from "../model/dashboard-tools";
import { resolveToolIcon } from "../lib/resolve-tool-icon";
import type { IDashboardTool } from "../model/dashboard-tools";
import type { DashboardToolDescriptionMap } from "./fetch-dashboard-tool-descriptions";

type MainPageResponse = components["schemas"]["MainPageResponse"];
type GlobalBlockResponse = components["schemas"]["GlobalBlockResponse"];
type GlobalBlock = components["schemas"]["GlobalBlock"];
type HeroSection = components["schemas"]["SectionsHeroSectionComponent"];

interface ServiceRouteRef {
  readonly slug: string;
  readonly isDefault: boolean;
}

const isGlobalBlock = (value: unknown): value is GlobalBlock =>
  typeof value === "object" && value !== null && "widgets" in value;

const normalizeSlug = (slug?: string | null): string => {
  if (!slug) return "/";

  return slug.startsWith("/") ? slug : `/${slug}`;
};

const normalizeCanonicalSlug = (slug?: string | null): string =>
  (slug ?? "").replace(/^\//, "").replace(/\/$/, "");

const getCanonicalSlugBySlug = (
  serviceRoutes: readonly ServiceRouteRef[]
): Map<string, string> => {
  const slugMap = new Map<string, string>();

  for (const route of serviceRoutes) {
    if (!route.isDefault) continue;

    slugMap.set(route.slug, route.slug);
  }

  return slugMap;
};

/**
 * Fetches dashboard tools from the CMS (OnlyDoc service pages) so that
 * the dashboard uses the correct OnlyDoc icons rather than the static
 * pdf-fly fallback icons.  Falls back to the static DASHBOARD_TOOLS list
 * if the CMS request fails.
 */
export const fetchDashboardTools = async (
  locale: ELanguages = ELanguages.ENGLISH,
  serviceRoutes: readonly ServiceRouteRef[] = [],
  descriptionMap: DashboardToolDescriptionMap = {}
): Promise<IDashboardTool[]> => {
  const t = createServerT(locale);
  const fallbackTools = buildDashboardTools(t);
  const canonicalSlugByLocalizedSlug = getCanonicalSlugBySlug(serviceRoutes);

  try {
    const mainPageResponse = await cmsHttpClient.getPage<MainPageResponse>(
      `${STRAPI_ROUTES.MAIN_PAGE}?pLevel=6&locale=${locale}`
    );

    const heroSection = mainPageResponse?.data?.sections?.find(
      (section): section is HeroSection =>
        section.__component === "sections.hero-section"
    );

    const servicesRef = heroSection?.services_group?.services;
    const documentId = isGlobalBlock(servicesRef)
      ? servicesRef.documentId
      : undefined;

    if (!documentId) {
      logger.warn("fetchDashboardTools: no services block found in CMS");

      return fallbackTools;
    }

    const servicesBlockResponse =
      await cmsHttpClient.getPage<GlobalBlockResponse>(
        `${STRAPI_ROUTES.GLOBAL_BLOCKS}/${documentId}?pLevel=5&locale=${locale}`
      );

    const servicesBlock = servicesBlockResponse?.data;
    const servicesWidget = servicesBlock?.widgets?.find(
      (widget): widget is components["schemas"]["SectionsServicesComponent"] =>
        "__component" in widget && widget.__component === "sections.services"
    );

    const categories = servicesWidget?.category_item ?? [];
    const tools: IDashboardTool[] = [];

    for (const category of categories) {
      for (const service of category.service_item ?? []) {
        const rawSlug = normalizeCanonicalSlug(service.slug);
        const id = canonicalSlugByLocalizedSlug.get(rawSlug) ?? rawSlug;

        if (HIDDEN_TOOL_IDS.has(id)) continue;

        const toolCategory = categorizeCmsTool(id, category.category_id);

        tools.push({
          id,
          title: service.title ?? "",
          description: descriptionMap[id] ?? getToolDescription(id, t),
          icon: resolveToolIcon(service.image?.url, id),
          url: normalizeSlug(id),
          category: toolCategory,
        });
      }
    }

    return tools.length > 0 ? tools : fallbackTools;
  } catch (error) {
    logger.error("fetchDashboardTools: failed to fetch from CMS", error);

    return fallbackTools;
  }
};
