import type { components } from "../../../api/cms/cms-schema";
import type { FaqItem } from "../model/types";

/** CMS `sections.faq` dynamic-zone component. */
export type CmsFaqComponent = components["schemas"]["SectionsFaqComponent"];

/** Compose the FAQ heading from the CMS prefix / middle / suffix parts. */
export const getCmsFaqTitle = (
  faq: CmsFaqComponent | undefined,
  fallback = "Frequently asked questions"
): string => {
  if (!faq) return fallback;

  const composed = [faq.prefix, faq.middle_title, faq.suffix]
    .filter(Boolean)
    .join(" ")
    .trim();

  return composed || fallback;
};

/** Map a CMS FAQ component to the shared `FaqItem[]` shape. */
export const mapCmsFaqItems = (
  faq: CmsFaqComponent | undefined
): readonly FaqItem[] => {
  if (!faq?.q_and_a?.length) return [];

  return faq.q_and_a.map((qa, index) => ({
    id: String(qa.id ?? index + 1),
    question: qa.question,
    answer: qa.answer,
  }));
};
