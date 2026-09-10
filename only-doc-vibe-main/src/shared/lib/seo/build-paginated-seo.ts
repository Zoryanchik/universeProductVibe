import { WEB_HOST } from "astro:env/client";

import type { components } from "../../api/cms/cms-schema";
import type { ELanguages } from "../../constants/languages";
import type { EPageType } from "../../constants/page-type";
import type { SeoProps } from "../../types/seo/meta";
import { createServerT } from "../translations/server-t";
import { generateSchema } from "./generate-schema";
import { getHreflangs, getHreflangsFromSlugMap } from "./get-hreflangs";

const DEFAULT_COVER_IMAGE =
  "https://cms.onlydoc.app/uploads/onlydoc_og_default.png";

type SeoComponent = components["schemas"]["SeoSeoComponent"];

interface IBlogPaginatedSeo {
  readonly page: string;
  readonly metaTitle?: string;
  readonly metaDescription?: string;
  readonly metaImage?: { url?: string };
}

interface BuildPaginatedSeoArgs {
  readonly baseSeo: SeoComponent | undefined;
  readonly paginatedOverrides: ReadonlyArray<IBlogPaginatedSeo> | undefined;
  readonly page: number;
  readonly pathname: string;
  readonly locale: ELanguages;
  readonly pageType: EPageType;
  readonly localeSlugMap?: Record<string, string>;
  readonly availableLocales: ReadonlyArray<ELanguages>;
}

/**
 * Build SEO props for a (potentially paginated) blog page.
 * - Always emits a self-referencing canonical for the current pathname.
 * - Merges optional `paginated_seo[page=N]` overrides on top of the base SEO.
 */
export const buildPaginatedSeo = ({
  baseSeo,
  paginatedOverrides,
  page,
  pathname,
  locale,
  pageType,
  localeSlugMap,
  availableLocales,
}: BuildPaginatedSeoArgs): SeoProps => {
  const override = paginatedOverrides?.find(
    (entry) => entry.page === String(page)
  );

  const merged: SeoComponent | undefined = baseSeo
    ? ({
        ...baseSeo,
        ...(override ?? {}),
        metaImage: override?.metaImage ?? baseSeo.metaImage,
      } as SeoComponent)
    : (override as SeoComponent | undefined);

  const baseTitle = merged?.metaTitle;
  let metaTitle = baseTitle;
  if (baseTitle && page > 1) {
    const t = createServerT(locale);
    const pageSuffix = t("seo.blog.page_n_suffix", { page }) as string;
    metaTitle = `${baseTitle} | ${pageSuffix}`;
  }

  const metaDescription = merged?.metaDescription;
  const metaImage = merged?.metaImage as { url?: string } | undefined;
  const imageUrl = metaImage?.url ?? DEFAULT_COVER_IMAGE;

  const { hreflangs } = localeSlugMap
    ? getHreflangsFromSlugMap(localeSlugMap)
    : getHreflangs([...new Set([...availableLocales, locale])], pathname);

  const canonicalUrl = `https://${WEB_HOST}${pathname}`;

  const schema = generateSchema(pathname, metaDescription, metaTitle, pageType);

  return {
    title: metaTitle,
    description: metaDescription,
    imageUrl,
    hreflangs,
    canonicalUrl,
    schema,
  } as SeoProps;
};
