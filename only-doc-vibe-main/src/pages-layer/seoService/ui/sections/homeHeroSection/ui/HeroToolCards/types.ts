import type { EServiceTabId, IToolCard } from "@/shared/constants/service-tabs";

export interface IFeatureHighlight {
  readonly id: string;
  readonly label: string;
  readonly iconUrl: string;
}

export interface IHeroToolCardsProps {
  readonly cards: readonly IToolCard[];
  readonly activeCategory: EServiceTabId;
  readonly featureHighlights?: readonly IFeatureHighlight[];
}

export interface IToolCardItemProps {
  readonly card: IToolCard;
}
