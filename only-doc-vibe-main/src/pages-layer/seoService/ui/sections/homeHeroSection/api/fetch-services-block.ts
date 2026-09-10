import type { components } from "@/shared/api/cms/cms-schema";
import { cmsHttpClient } from "@/shared/api/cms/cms-http-client";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";
import type { ELanguages } from "@/shared/constants/languages";

type GlobalBlockResponse = components["schemas"]["GlobalBlockResponse"];
type GlobalBlock = components["schemas"]["GlobalBlock"];

/**
 * The main page pLevel doesn't populate service_item inside category_item
 * (too many nested levels through the relation boundary).
 * Fetch the GlobalBlock directly by its documentId with its own pLevel.
 *
 * In Strapi v5, fetching a document by `documentId` without `?locale=` returns
 * the default-locale variant. Pass the current page locale so localized blocks
 * (e.g. PT) are returned.
 */
export const fetchServicesBlock = async (
  cmsServicesGroup?: components["schemas"]["ServiceServicesGroupComponent"],
  locale?: ELanguages
): Promise<GlobalBlock | undefined> => {
  const servicesDocumentId = (
    cmsServicesGroup?.services as GlobalBlock | undefined
  )?.documentId;

  if (!servicesDocumentId) return undefined;

  const localeQuery = locale ? `&locale=${locale}` : "";

  try {
    const response = await cmsHttpClient.getPage<GlobalBlockResponse>(
      `${STRAPI_ROUTES.GLOBAL_BLOCKS}/${servicesDocumentId}?pLevel=5${localeQuery}`
    );

    return response?.data;
  } catch {
    return undefined;
  }
};
