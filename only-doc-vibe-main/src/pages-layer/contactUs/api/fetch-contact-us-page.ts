import { cmsHttpClient } from "@/shared/api/cms/cms-http-client";
import type { components } from "@/shared/api/cms/cms-schema";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";
import { logger } from "@/shared/lib/utils/logger";

type ContactUsResponse = components["schemas"]["ContactUsResponse"];
type ContactUsData = ContactUsResponse["data"];

export const fetchContactUsPage = async (
  locale: string
): Promise<ContactUsData | undefined> => {
  try {
    const response = await cmsHttpClient.getPage<ContactUsResponse>(
      `${STRAPI_ROUTES.CONTACT_US_PAGE}?pLevel=6&locale=${locale}`
    );

    if (!response?.data) {
      logger.warn("Contact us page data not found");

      return undefined;
    }

    return response.data;
  } catch (error) {
    logger.error("Failed to fetch contact us page data", error);

    return undefined;
  }
};
