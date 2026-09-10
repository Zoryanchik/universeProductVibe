import { cmsHttpClient } from "@/shared/api/cms/cms-http-client";
import type { components } from "@/shared/api/cms/cms-schema";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";
import { logger } from "@/shared/lib/utils/logger";

type AboutUsResponse = components["schemas"]["AboutUsResponse"];
type AboutUsData = AboutUsResponse["data"];

export const fetchAboutUsPage = async (
  locale: string
): Promise<AboutUsData | undefined> => {
  try {
    const response = await cmsHttpClient.getPage<AboutUsResponse>(
      `${STRAPI_ROUTES.ABOUT_US}?pLevel=6&locale=${locale}`
    );

    if (!response?.data) {
      logger.warn("About us page data not found");

      return undefined;
    }

    return response.data;
  } catch (error) {
    logger.error("Failed to fetch about us page data", error);

    return undefined;
  }
};
