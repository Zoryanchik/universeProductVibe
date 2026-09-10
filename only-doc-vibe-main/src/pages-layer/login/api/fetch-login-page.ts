import { cmsHttpClient } from "@/shared/api/cms/cms-http-client";
import type { components } from "@/shared/api/cms/cms-schema";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";
import { logger } from "@/shared/lib/utils/logger";

type LogInResponse = components["schemas"]["LogInResponse"];
type LogInData = LogInResponse["data"];

export const fetchLoginPage = async (
  locale: string
): Promise<LogInData | undefined> => {
  try {
    const response = await cmsHttpClient.getPage<LogInResponse>(
      `${STRAPI_ROUTES.LOG_IN}?pLevel=6&locale=${locale}`
    );

    if (!response?.data) {
      logger.warn(`Login page data not found for locale: ${locale}`);

      return undefined;
    }

    return response.data;
  } catch (error) {
    logger.error(
      `Failed to fetch login page data for locale: ${locale}`,
      error
    );

    return undefined;
  }
};
