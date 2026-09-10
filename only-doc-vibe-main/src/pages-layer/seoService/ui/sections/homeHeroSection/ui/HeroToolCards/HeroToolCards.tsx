"use client";

import type { FC } from "react";

import { useHeroToolCards } from "./lib/useHeroToolCards";
import type { IHeroToolCardsProps } from "./types";
import { LargeToolCardsView } from "./ui/LargeToolCardsView";
import { MobileToolCardsView } from "./ui/MobileToolCardsView";
import { ShowMoreButton } from "./ui/ShowMoreButton";

export const HeroToolCards: FC<IHeroToolCardsProps> = ({
  cards,
  activeCategory,
}) => {
  const {
    filteredCards,
    showMoreButton,
    rowsLg,
    handleShowMore,
    getCardVisibility,
  } = useHeroToolCards({ cards, activeCategory });

  return (
    <div className="flex w-full flex-col items-center gap-3 min-[600px]:gap-4 md:gap-5">
      <div className="w-full px-4 md:px-0">
        <MobileToolCardsView
          cards={filteredCards}
          getCardVisibility={getCardVisibility}
        />
        <div className="hidden md:block">
          <LargeToolCardsView rows={rowsLg} />
        </div>
      </div>

      {showMoreButton && <ShowMoreButton onClick={handleShowMore} />}
    </div>
  );
};
