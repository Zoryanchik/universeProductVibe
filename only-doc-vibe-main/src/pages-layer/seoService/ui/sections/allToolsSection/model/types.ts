import type { IToolCard } from "@/shared/constants/service-tabs";

import type { IServiceTab } from "../../homeHeroSection/ui/HeroServiceTabs";
import type { IFeatureHighlight } from "../../homeHeroSection/ui/HeroToolCards";

export interface IAllToolsSectionProps {
  readonly title: string | Record<string, string | undefined>;
  readonly tabs: readonly IServiceTab[];
  readonly cards: readonly IToolCard[];
  readonly featureHighlights?: readonly IFeatureHighlight[];
  readonly showMoreButtonText?: string;
}
