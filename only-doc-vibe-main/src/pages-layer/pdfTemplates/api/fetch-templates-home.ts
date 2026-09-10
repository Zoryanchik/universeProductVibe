import type { components } from "@/shared/api/cms/cms-schema";
import { cmsHttpClient } from "@/shared/api/cms/cms-http-client";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";
import type { ELanguages } from "@/shared/constants/languages";
import { logger } from "@/shared/lib/utils/logger";

import type { CmsTemplatesHome } from "../model/types";

type TemplatesHomeResponse = components["schemas"]["TemplatesHomeResponse"];

export const fetchTemplatesHome = async (
  locale: ELanguages
): Promise<CmsTemplatesHome | undefined> => {
  try {
    const { data } = await cmsHttpClient.getPage<TemplatesHomeResponse>(
      `${STRAPI_ROUTES.TEMPLATES_HOME}?pLevel=4&locale=${locale}`
    );

    return data ?? undefined;
  } catch (error) {
    logger.warn(`templates-home not available for locale: ${locale}`, error);

    return undefined;
  }
};
