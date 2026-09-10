import type { components } from "../cms/cms-schema";
import { cmsHttpClient } from "../cms/cms-http-client";
import { STRAPI_ROUTES } from "../strapi-routes";
import { logger } from "../../lib/utils/logger";

type NavbarResponse = components["schemas"]["NavbarResponse"];
type NavbarData = components["schemas"]["NavbarResponse"]["data"];
type MainPageResponse = components["schemas"]["MainPageResponse"];
type GlobalBlockResponse = components["schemas"]["GlobalBlockResponse"];
type GlobalBlock = components["schemas"]["GlobalBlock"];
type HeroSection = components["schemas"]["SectionsHeroSectionComponent"];
type ServiceCategory = components["schemas"]["ServiceServiceCategoryComponent"];

interface CmsMenuItem {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly custom_link_id: string;
  readonly icon?: {
    readonly url?: string;
    readonly alternativeText?: string | null;
  };
}

interface CmsMenuGroup {
  readonly id: string;
  readonly title: string;
  readonly link_item: readonly CmsMenuItem[];
}

const isGlobalBlock = (value: unknown): value is GlobalBlock =>
  typeof value === "object" && value !== null && "widgets" in value;

const normalizeSlug = (slug?: string | null): string => {
  if (!slug) return "/";

  return slug.startsWith("/") ? slug : `/${slug}`;
};

const mapCategoryToGroup = (category: ServiceCategory): CmsMenuGroup => {
  const items = (category.service_item ?? []).map((service) => ({
    id: String(service.id),
    title: service.title,
    url: normalizeSlug(service.slug),
    custom_link_id: String(service.id),
    icon: {
      url: service.image?.url,
      alternativeText: service.image?.alternativeText,
    },
  }));

  return {
    id: category.category_id,
    title: category.title,
    link_item: items,
  };
};

const CONVERT_CATEGORY_IDS = new Set(["convert-to-pdf", "convert-from-pdf"]);

const buildToolsMenuGroupsFromServicesBlock = (
  servicesBlock?: GlobalBlock
): { allTools: CmsMenuGroup[]; convertPdf: CmsMenuGroup[] } => {
  const servicesWidget = servicesBlock?.widgets?.find(
    (widget): widget is components["schemas"]["SectionsServicesComponent"] =>
      "__component" in widget && widget.__component === "sections.services"
  );

  const categories = servicesWidget?.category_item ?? [];
  const mappedGroups = categories.map(mapCategoryToGroup);

  return {
    allTools: mappedGroups.filter(
      (group) => !CONVERT_CATEGORY_IDS.has(group.id)
    ),
    convertPdf: mappedGroups.filter((group) =>
      CONVERT_CATEGORY_IDS.has(group.id)
    ),
  };
};

const fetchServicesBlockForNavbar = async (
  locale: string
): Promise<GlobalBlock | undefined> => {
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

  if (!documentId) return undefined;

  const servicesBlockResponse =
    await cmsHttpClient.getPage<GlobalBlockResponse>(
      `${STRAPI_ROUTES.GLOBAL_BLOCKS}/${documentId}?pLevel=5&locale=${locale}`
    );

  return servicesBlockResponse?.data;
};

const withCmsToolsMenus = async (
  navbarData: NavbarData,
  locale: string
): Promise<NavbarData> => {
  try {
    const servicesBlock = await fetchServicesBlockForNavbar(locale);
    const { allTools, convertPdf } =
      buildToolsMenuGroupsFromServicesBlock(servicesBlock);

    if (!allTools.length && !convertPdf.length) return navbarData;

    const navLinks = navbarData.section?.navigation_panel?.nav_link;
    if (!navLinks?.length) return navbarData;

    const patchedNavLinks = navLinks.map((item) => {
      if (item.link_id === "all_tools" && allTools.length) {
        return {
          ...item,
          tools_links: allTools,
        };
      }

      if (
        (item.link_id === "convert_pdf" ||
          item.link_id === "convert_pdf_page") &&
        convertPdf.length
      ) {
        return {
          ...item,
          tools_links: convertPdf,
        };
      }

      return item;
    });

    return {
      ...navbarData,
      section: {
        ...navbarData.section,
        navigation_panel: {
          ...navbarData.section.navigation_panel,
          nav_link: patchedNavLinks,
        },
      },
    };
  } catch (error) {
    logger.warn(
      `Failed to enrich navbar tools menu from services block for locale: ${locale}`,
      error
    );

    return navbarData;
  }
};

export const fetchNavbar = async (
  locale: string
): Promise<NavbarData | undefined> => {
  try {
    const { data } = await cmsHttpClient.getPage<NavbarResponse>(
      `${STRAPI_ROUTES.NAVBAR}?pLevel=8&locale=${locale}`
    );

    if (!data) {
      logger.warn(`Navbar data not found for locale: ${locale}`);

      return undefined;
    }

    return await withCmsToolsMenus(data, locale);
  } catch (error) {
    logger.error(`Failed to fetch navbar data for locale: ${locale}`, error);

    return undefined;
  }
};
