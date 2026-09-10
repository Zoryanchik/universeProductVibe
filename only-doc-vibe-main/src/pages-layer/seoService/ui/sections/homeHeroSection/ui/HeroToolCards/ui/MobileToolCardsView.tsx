import type { FC } from "react";

import type { IToolCard } from "@/shared/constants/service-tabs";

import { ToolCardItem } from "../ToolCardItem";

interface MobileToolCardsViewProps {
  readonly cards: readonly IToolCard[];
  readonly getCardVisibility: (cardIndex: number) => {
    readonly isHiddenOnSmall: boolean;
    readonly isHiddenOnTablet: boolean;
  };
}

export const MobileToolCardsView: FC<MobileToolCardsViewProps> = ({
  cards,
  getCardVisibility,
}) => {
  return (
    <div className="grid w-full grid-cols-2 gap-2 md:hidden">
      {cards.map((card, cardIndex) => {
        const { isHiddenOnSmall } = getCardVisibility(cardIndex);

        return (
          <div key={card.id} className={isHiddenOnSmall ? "hidden" : ""}>
            <ToolCardItem card={card} />
          </div>
        );
      })}
    </div>
  );
};
