import type { TFunction } from "../../../lib/translations";
import type { FaqItem } from "../model/types";

/**
 * Extracts FAQ items from translations.
 * @param t - Translation function
 * @param translationKey - The translation key prefix (e.g., "faqSectionMainPage")
 * @param itemCount - Number of FAQ items to extract
 *
 * Expects translation structure:
 * {
 *   "[translationKey].items.1.question": "...",
 *   "[translationKey].items.1.answer": "...",
 *   ...
 * }
 */
export const getFaqItems = (
  t: TFunction,
  translationKey: string = "faqSectionMainPage",
  itemCount: number = 5
): readonly FaqItem[] => {
  return Array.from({ length: itemCount }, (_, index) => {
    const id = String(index + 1);

    return {
      id,
      question: String(t(`${translationKey}.items.${id}.question`)),
      answer: String(t(`${translationKey}.items.${id}.answer`)),
    };
  });
};
