import type { components } from "@/shared/api/cms/cms-schema";
import type { CmsModalContentMap } from "@/shared/lib/cms-modal-content";
import { cmsHttpClient } from "@/shared/api/cms/cms-http-client";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";
import { defaultLocale } from "@/shared/config/locale";
import { logger } from "@/shared/lib/utils/logger";

type ServicePageListResponse = components["schemas"]["ServicePageListResponse"];
type ServicePage = components["schemas"]["ServicePage"];
type GlobalElementResponse = components["schemas"]["GlobalElementResponse"];

const MODAL_KEYS = new Set([
  "modals.translate-modal",
  "modals.compress-modal",
  "modals.convert-modal",
  "modals.upload-processing-modal",
]);

const SERVICE_SLUGS_FOR_MODALS = [
  "/compress-pdf",
  "/pdf-converter",
  "/translate-pdf",
];

async function fetchServicePageSections(
  slug: string,
  locale: string
): Promise<ServicePage | null> {
  try {
    // Modal slugs are canonical/default-locale slugs. Localized service pages
    // can have translated slugs, so resolve the default page first and then
    // fetch its localized document variant when needed.
    const { data } = await cmsHttpClient.getPage<ServicePageListResponse>(
      `${STRAPI_ROUTES.SERVICE_PAGES}?pLevel=6&filters[slug][$eq]=${slug}&locale=${defaultLocale}`
    );
    const defaultPage = data?.[0] ?? null;

    if (!defaultPage || locale === defaultLocale) return defaultPage;

    const documentId = (defaultPage as ServicePage & { documentId?: string })
      .documentId;
    if (!documentId) return defaultPage;

    try {
      const localized = await cmsHttpClient.getPage<{
        data: ServicePage | null;
      }>(
        `${STRAPI_ROUTES.SERVICE_PAGES}/${documentId}?pLevel=6&locale=${locale}`
      );

      return localized?.data ?? defaultPage;
    } catch (error) {
      logger.error(
        `[dashboard] Failed to fetch ${locale} localization for ${slug}:`,
        error
      );

      return defaultPage;
    }
  } catch (error) {
    logger.error(`[dashboard] Failed to fetch service page ${slug}:`, error);

    return null;
  }
}

async function hydrateGlobalElement(
  target: Record<string, unknown>,
  locale: string
): Promise<void> {
  const geRef = target.global_element as { documentId?: string } | undefined;
  if (!geRef?.documentId) return;

  try {
    const response = await cmsHttpClient.getPage<GlobalElementResponse>(
      `${STRAPI_ROUTES.GLOBAL_ELEMENTS}/${geRef.documentId}?pLevel=5&locale=${locale}`
    );
    if (response?.data) {
      target.global_element = response.data;
    }
  } catch {
    // graceful degradation
  }
}

/**
 * Fetches CMS modal content from multiple service pages so that
 * compress / convert / translate modals have text on the dashboard.
 */
export async function fetchDashboardModalData(
  locale: string = defaultLocale
): Promise<Partial<CmsModalContentMap>> {
  const pages = await Promise.all(
    SERVICE_SLUGS_FOR_MODALS.map((slug) =>
      fetchServicePageSections(slug, locale)
    )
  );

  const data: Partial<CmsModalContentMap> = {};

  for (const page of pages) {
    if (!page?.sections) continue;

    for (const section of page.sections as Array<
      Record<string, unknown> & { __component: string }
    >) {
      const key = section.__component;

      if (!MODAL_KEYS.has(key)) {
        if (key === "sections.hero-section") {
          const hero =
            section as unknown as components["schemas"]["SectionsHeroSectionComponent"];

          if (
            hero.upload_processing_modal &&
            !data["modals.upload-processing-modal"]
          ) {
            data["modals.upload-processing-modal"] =
              hero.upload_processing_modal;
          }

          if (hero.convert_modal && !data["modals.convert-modal"]) {
            const raw = hero.convert_modal as unknown as Record<
              string,
              unknown
            >;
            await hydrateGlobalElement(raw, locale);

            type GE = components["schemas"]["GlobalElement"];
            const formats = (raw.global_element as GE | undefined)?.widgets?.[0]
              ?.formats;

            data["modals.convert-modal"] = {
              ...(raw as components["schemas"]["ModalsConvertModalComponent"]),
              formats,
            };
          }
        }

        continue;
      }

      if (key === "modals.compress-modal" && !data["modals.compress-modal"]) {
        data["modals.compress-modal"] =
          section as unknown as CmsModalContentMap["modals.compress-modal"];
      }

      if (key === "modals.translate-modal" && !data["modals.translate-modal"]) {
        data["modals.translate-modal"] =
          section as unknown as CmsModalContentMap["modals.translate-modal"];
      }

      if (key === "modals.convert-modal" && !data["modals.convert-modal"]) {
        const raw = section as unknown as Record<string, unknown>;
        await hydrateGlobalElement(raw, locale);

        type GE = components["schemas"]["GlobalElement"];
        const formats = (raw.global_element as GE | undefined)?.widgets?.[0]
          ?.formats;

        data["modals.convert-modal"] = {
          ...(raw as components["schemas"]["ModalsConvertModalComponent"]),
          formats,
        };
      }

      if (
        key === "modals.upload-processing-modal" &&
        !data["modals.upload-processing-modal"]
      ) {
        data["modals.upload-processing-modal"] =
          section as unknown as CmsModalContentMap["modals.upload-processing-modal"];
      }
    }
  }

  return data;
}
