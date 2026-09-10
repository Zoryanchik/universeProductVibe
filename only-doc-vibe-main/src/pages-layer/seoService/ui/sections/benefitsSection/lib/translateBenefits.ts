import type { IBenefitCard } from "../model/types";

interface TranslatedBenefit {
  readonly id: string;
  readonly emoji: string;
  readonly title: string;
  readonly description: string;
}

type TranslateFunction = (key: string) => string;

export const translateBenefits = (
  benefits: readonly IBenefitCard[],
  t: TranslateFunction
): readonly TranslatedBenefit[] =>
  benefits.map((benefit) => ({
    id: benefit.id,
    emoji: benefit.emoji,
    title: t(benefit.titleKey),
    description: t(benefit.descriptionKey),
  }));
