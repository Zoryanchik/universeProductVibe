import type { components } from "@/shared/api/cms/cms-schema";
import { cmsHttpClient } from "@/shared/api/cms/cms-http-client";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";

type GlobalElementResponse = components["schemas"]["GlobalElementResponse"];

/**
 * Fetches a GlobalElement by its `documentId` and patches the fully-populated
 * object back onto `target.global_element`.
 *
 * Many CMS relations arrive as bare references `{ id, documentId }` at shallow
 * populate depths. This helper resolves them so downstream code can access
 * nested data like `widgets[].formats[]`.
 */
export async function hydrateGlobalElement(
  target: Record<string, unknown>
): Promise<void> {
  const geRef = target.global_element as { documentId?: string } | undefined;

  if (!geRef?.documentId) return;

  try {
    const response = await cmsHttpClient.getPage<GlobalElementResponse>(
      `${STRAPI_ROUTES.GLOBAL_ELEMENTS}/${geRef.documentId}?pLevel=5`
    );

    if (response?.data) {
      target.global_element = response.data;
    }
  } catch {
    // global_element stays as bare reference; dependent features degrade gracefully
  }
}
