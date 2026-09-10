import { cmsHttpClient } from "@/shared/api/cms/cms-http-client";
import type { components } from "@/shared/api/cms/cms-schema";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";
import { logger } from "@/shared/lib/utils/logger";

type SignUpResponse = components["schemas"]["SignUpResponse"];
type SignUpData = SignUpResponse["data"];

export const fetchSignUpPage = async (
  locale: string
): Promise<SignUpData | undefined> => {
  try {
    const response = await cmsHttpClient.getPage<SignUpResponse>(
      `${STRAPI_ROUTES.SIGN_UP}?pLevel=6&locale=${locale}`
    );

    if (!response?.data) {
      logger.warn(`Sign up page data not found for locale: ${locale}`);

      return undefined;
    }

    return response.data;
  } catch (error) {
    logger.error(
      `Failed to fetch sign up page data for locale: ${locale}`,
      error
    );

    return undefined;
  }
};
