import { CMS_HOST } from "astro:env/server";

import type { components } from "@/shared/api/cms/cms-schema";
import { cmsHttpClient } from "@/shared/api/cms/cms-http-client";
import { STRAPI_ROUTES } from "@/shared/api/strapi-routes";
import { blocksToMarkdown } from "@/shared/lib/blog/blocks-to-markdown";
import { getCmsMediaUrl } from "@/shared/lib/cms/get-cms-media-url";
import type { ELanguages } from "@/shared/constants/languages";
import { logger } from "@/shared/lib/utils/logger";
import { stripSlashes } from "@/shared/lib/utils/stripSlashes";

import type { CmsFaqComponent, ITemplateCard } from "../model/types";
import { mapTemplateCard } from "./map-template-card";

type TemplatePageListResponse =
  components["schemas"]["TemplatePageListResponse"];

export interface ITemplatePageDetail {
  readonly slug: string;
  readonly title: string;
  readonly aboutMarkdown: string;
  readonly faq?: CmsFaqComponent;
  readonly seo?: components["schemas"]["SeoSeoComponent"];
  readonly coverImageUrl?: string;
  readonly coverImageAlt: string;
  readonly polotnoDocumentUrl?: string;
  readonly category?: { slug: string; title: string };
  readonly subcategory?: { slug: string; title: string };
  readonly relatedTemplates: ReadonlyArray<ITemplateCard>;
}

export const fetchTemplatePage = async (
  slug: string,
  locale: ELanguages
): Promise<ITemplatePageDetail | undefined> => {
  try {
    const { data } = await cmsHttpClient.getPage<TemplatePageListResponse>(
      `${STRAPI_ROUTES.TEMPLATE_PAGES}?pLevel=5&filters[slug][$eq]=${slug}&locale=${locale}`
    );

    const page = data?.[0];
    if (!page) return undefined;

    const card = mapTemplateCard(page);
    const category = page.category as { slug?: string; title?: string } | null;
    const subcategory = page.subcategory as {
      slug?: string;
      title?: string;
    } | null;
    const polotno = page.polotno_document as { url?: string } | null;

    return {
      slug: card?.slug ?? stripSlashes(page.slug),
      title: card?.title ?? slug,
      aboutMarkdown: blocksToMarkdown(page.about),
      faq: page.faq?.[0],
      seo: page.seo,
      coverImageUrl: card?.coverImageUrl,
      coverImageAlt: card?.coverImageAlt ?? page.title ?? slug,
      polotnoDocumentUrl: getCmsMediaUrl(polotno?.url, CMS_HOST),
      category: category?.slug
        ? {
            slug: stripSlashes(category.slug),
            title: category.title ?? "",
          }
        : undefined,
      subcategory: subcategory?.slug
        ? {
            slug: stripSlashes(subcategory.slug),
            title: subcategory.title ?? "",
          }
        : undefined,
      relatedTemplates: (page.related_templates ?? [])
        .map(mapTemplateCard)
        .filter((c): c is ITemplateCard => c !== null),
    };
  } catch (error) {
    logger.error(`Failed to fetch template page: ${slug}`, error);

    return undefined;
  }
};
