export interface IHowItWorksStepProps {
  readonly title: string;
  readonly description: string;
  readonly imageSrc?: string;
  readonly imageAlt?: string;
}

export interface IHowItWorksSectionProps {
  readonly title: string;
  readonly steps: readonly IHowItWorksStepProps[];
}
