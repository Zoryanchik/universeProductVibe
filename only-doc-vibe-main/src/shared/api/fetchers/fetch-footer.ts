import type { components } from "../cms/cms-schema";
import { cmsHttpClient } from "../cms/cms-http-client";
import { STRAPI_ROUTES } from "../strapi-routes";
import { logger } from "../../lib/utils/logger";

type FooterResponse = components["schemas"]["FooterResponse"];
type FooterData = components["schemas"]["FooterListResponse"]["data"][0];

export const fetchFooter = async (
  locale: string
): Promise<FooterData | undefined> => {
  try {
    const { data } = await cmsHttpClient.getPage<FooterResponse>(
      `${STRAPI_ROUTES.FOOTER}?pLevel=6&locale=${locale}`
    );

    if (!data) {
      logger.warn(`Footer data not found for locale: ${locale}`);

      return undefined;
    }

    return data;
  } catch (error) {
    logger.error(`Failed to fetch footer data for locale: ${locale}`, error);

    return undefined;
  }
};
