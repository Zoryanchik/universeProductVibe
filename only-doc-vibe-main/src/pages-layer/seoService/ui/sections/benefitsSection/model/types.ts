export interface IBenefitCard {
  readonly id: string;
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly emoji: string;
}

export interface IBenefitsSectionProps {
  readonly titleKey: string;
  readonly benefits: readonly IBenefitCard[];
}
