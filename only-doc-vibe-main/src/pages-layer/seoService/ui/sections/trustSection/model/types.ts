export interface ITrustBadge {
  readonly id: string;
  readonly name: string;
  readonly iconPath: string;
  readonly alt: string;
}

export interface ITrustSectionProps {
  readonly title: string;
  readonly badges: readonly ITrustBadge[];
  readonly disableBackground?: boolean;
  readonly variant?: "default" | "about-us";
}
