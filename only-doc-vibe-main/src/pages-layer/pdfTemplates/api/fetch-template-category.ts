import type { components } from "@/shared/api/cms/cms-schema";
import { cmsHttpClient } from "@/shared/api/cms/cms-http-client";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";
import type { ELanguages } from "@/shared/constants/languages";
import { logger } from "@/shared/lib/utils/logger";

import type {
  CmsTemplateCategory,
  CmsTemplateSubcategory,
} from "../model/types";

type CategoryListResponse =
  components["schemas"]["TemplateCategoryListResponse"];
type SubcategoryListResponse =
  components["schemas"]["TemplateSubcategoryListResponse"];

export const fetchTemplateCategory = async (
  slug: string,
  locale: ELanguages
): Promise<CmsTemplateCategory | undefined> => {
  try {
    const { data } = await cmsHttpClient.getPage<CategoryListResponse>(
      `${STRAPI_ROUTES.TEMPLATE_CATEGORIES}?pLevel=4&filters[slug][$eq]=${slug}&locale=${locale}`
    );

    return data?.[0];
  } catch (error) {
    logger.error(`Failed to fetch template category: ${slug}`, error);

    return undefined;
  }
};

export const fetchTemplateSubcategory = async (
  slug: string,
  locale: ELanguages
): Promise<CmsTemplateSubcategory | undefined> => {
  try {
    const { data } = await cmsHttpClient.getPage<SubcategoryListResponse>(
      `${STRAPI_ROUTES.TEMPLATE_SUBCATEGORIES}?pLevel=4&filters[slug][$eq]=${slug}&locale=${locale}`
    );

    return data?.[0];
  } catch (error) {
    logger.error(`Failed to fetch template subcategory: ${slug}`, error);

    return undefined;
  }
};
