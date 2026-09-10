import { cmsHttpClient } from "@/shared/api/cms/cms-http-client";
import type { components } from "@/shared/api/cms/cms-schema";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";
import { defaultLocale } from "@/shared/config/locale";
import { logger } from "@/shared/lib/utils/logger";

type MainPageResponse = components["schemas"]["MainPageResponse"];
type MainPageData = components["schemas"]["MainPage"];

export const fetchMainPage = async (
  locale: string = defaultLocale
): Promise<MainPageData | undefined> => {
  try {
    const response = await cmsHttpClient.getPage<MainPageResponse>(
      `${STRAPI_ROUTES.MAIN_PAGE}?pLevel=6&locale=${locale}`
    );

    if (!response?.data) {
      logger.warn(`Main page data not found for locale: ${locale}`);

      return undefined;
    }

    return response.data;
  } catch (error) {
    logger.error(`Failed to fetch main page data for locale: ${locale}`, error);

    return undefined;
  }
};
