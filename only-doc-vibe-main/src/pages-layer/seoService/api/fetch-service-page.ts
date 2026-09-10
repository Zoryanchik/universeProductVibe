import type { components } from "@/shared/api/cms/cms-schema";
import { cmsHttpClient } from "@/shared/api/cms/cms-http-client";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";
import { defaultLocale } from "@/shared/config/locale";
import { logger } from "@/shared/lib/utils/logger";

type ServicePageListResponse = components["schemas"]["ServicePageListResponse"];
type ServicePage = components["schemas"]["ServicePage"];

export async function fetchServicePage(
  service: string,
  locale: string = defaultLocale
): Promise<ServicePage | null> {
  try {
    const normalizedSlug = service.startsWith("/") ? service : `/${service}`;
    const { data } = await cmsHttpClient.getPage<ServicePageListResponse>(
      `${STRAPI_ROUTES.SERVICE_PAGES}?pLevel=6&filters[slug][$eq]=${normalizedSlug}&locale=${locale}`
    );

    return data?.[0] ?? null;
  } catch (error) {
    logger.error(
      `Failed to fetch service page data for ${service} in locale ${locale}:`,
      error
    );

    return null;
  }
}
