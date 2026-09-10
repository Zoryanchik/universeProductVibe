import { WEB_HOST } from "astro:env/client";

import type { FaqItem } from "../../ui/faq-section";
import type { components } from "../../api/cms/cms-schema";
import { availableLocales } from "../../config/locale";
import type { ELanguages } from "../../constants/languages";
import type { EPageType } from "../../constants/page-type";
import type { SeoProps } from "../../types/seo/meta";
import type { FaqSection } from "../../types/seo/schema";
import { generateSchema } from "./generate-schema";
import { getHreflangs, getHreflangsFromSlugMap } from "./get-hreflangs";

const convertFaqItemsToSection = (items: readonly FaqItem[]): FaqSection[] => {
  if (items.length === 0) {
    return [];
  }

  return [
    {
      __component: "sections.faq",
      questions: items.map((item) => ({
        question: item.question,
        answer: item.answer,
      })),
    },
  ];
};

const FALLBACK_PUBLISHED_DATE = "2025-01-21";
type SeoWithOptionalDates = components["schemas"]["SeoSeoComponent"] & {
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

const toSchemaDate = (value?: string): string | undefined => {
  if (!value) return undefined;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;

  return parsed.toISOString().split("T")[0];
};

export function prepareSeoData(
  seo: SeoWithOptionalDates | null | undefined,
  pathname: string,
  pageType: EPageType,
  locale: ELanguages,
  faqItems?: FaqItem[],
  localeSlugMap?: Record<string, string>
  // sections?: unknown[]
): SeoProps {
  const { metaTitle, metaDescription, metaImage } = seo ?? {};

  const coverImage = (metaImage?.url as string) ?? "";

  const { hreflangs } = localeSlugMap
    ? getHreflangsFromSlugMap(localeSlugMap)
    : (() => {
        const uniqueLocales = [
          ...new Set<ELanguages>([...availableLocales, locale]),
        ];

        return getHreflangs(uniqueLocales, pathname);
      })();

  const canonicalUrl = `https://${WEB_HOST}${pathname}`;

  // Extract data from sections for schema generation
  // const faqSections = extractFaqSections(sections);
  // const h1 = extractH1(sections);
  // const howToImageUrl = extractHowToImageUrl(sections);

  const faqSections = convertFaqItemsToSection(faqItems ?? []);

  const datePublished =
    toSchemaDate(seo?.publishedAt) ??
    toSchemaDate(seo?.createdAt) ??
    FALLBACK_PUBLISHED_DATE;
  const dateModified = toSchemaDate(seo?.updatedAt);

  const schema = generateSchema(
    pathname,
    metaDescription,
    metaTitle,
    pageType,
    faqSections,
    {
      datePublished,
      dateModified,
    }
  );

  const seoProps = {
    metaTitle,
    metaDescription,
    imageUrl: coverImage,
    hreflangs,
    canonicalUrl,
    schema,
  };

  return seoProps;
}
