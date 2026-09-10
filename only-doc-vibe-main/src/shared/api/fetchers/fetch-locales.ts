import type { components } from "../cms/cms-schema";
import { cmsHttpClient } from "../cms/cms-http-client";
import { STRAPI_ROUTES } from "../strapi-routes";
import { logger } from "../../lib/utils/logger";

type DataLocalesResponse = components["schemas"]["DataLocaleListResponse"];
type LocalesData = components["schemas"]["DataLocaleListResponse"]["data"];

export const fetchLocales = async (): Promise<LocalesData | undefined> => {
  try {
    const { data } = await cmsHttpClient.getPage<DataLocalesResponse>(
      `${STRAPI_ROUTES.DATA_LOCALES}?pLevel=6`
    );

    if (!data) {
      logger.warn("Locales data not found");

      return undefined;
    }

    return data;
  } catch (error) {
    logger.error("Failed to fetch locales data", error);

    return undefined;
  }
};
