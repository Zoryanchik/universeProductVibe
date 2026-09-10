import type { IToolCard } from "@/shared/constants/service-tabs";

import type { IServiceTab } from "../HeroServiceTabs";
import type { IFeatureHighlight } from "../HeroToolCards";

export interface IHeroServiceSectionProps {
  readonly tabs: readonly IServiceTab[];
  readonly cards: readonly IToolCard[];
  readonly featureHighlights?: readonly IFeatureHighlight[];
  readonly showMoreButtonText?: string;
}
