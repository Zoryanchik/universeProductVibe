export interface Review {
  readonly id: string;
  readonly title: string;
  readonly text: string;
  readonly author: string;
  readonly date: string;
}

export interface ReviewsSectionProps {
  readonly title: string;
  readonly reviews: readonly Review[];
}

export interface ReviewCardProps {
  readonly review: Review;
  readonly index: number;
}
