"use client";

import { type FC, useMemo } from "react";

import { DEFAULT_SERVICE_TAB_ID } from "../../model/constants";
import { HeroServiceTabs } from "../HeroServiceTabs";
import {
  useHeroToolCards,
  MobileToolCardsView,
  MediumToolCardsView,
  LargeToolCardsView,
  ShowMoreButton,
} from "../HeroToolCards";
import { useHeroServiceSection } from "./lib";
import type { IHeroServiceSectionProps } from "./types";

export const HeroServiceSection: FC<IHeroServiceSectionProps> = ({
  tabs,
  cards,
  featureHighlights,
  showMoreButtonText,
}) => {
  const { activeCategory, contentRef, handleTabChange } =
    useHeroServiceSection();

  const {
    filteredCards,
    showMoreButton,
    rowsLg,
    handleShowMore,
    getCardVisibility,
  } = useHeroToolCards({ cards, activeCategory });

  const inactiveCards = useMemo(
    () => cards.filter((card) => card.category !== activeCategory),
    [cards, activeCategory]
  );

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="w-full overflow-x-auto pb-5">
        <HeroServiceTabs
          tabs={tabs}
          onTabChange={handleTabChange}
          defaultTabId={DEFAULT_SERVICE_TAB_ID}
        />
      </div>

      <div
        ref={contentRef}
        className="w-full transition-all duration-300 ease-in-out"
      >
        <div className="flex w-full flex-col items-center gap-4">
          <div className="w-full">
            <MobileToolCardsView
              cards={filteredCards}
              getCardVisibility={getCardVisibility}
            />
            <div className="hidden md:block lg:hidden">
              <MediumToolCardsView
                rows={rowsLg}
                featureHighlights={featureHighlights}
              />
            </div>
            <div className="hidden lg:block">
              <LargeToolCardsView rows={rowsLg} />
            </div>
          </div>

          {showMoreButton && (
            <ShowMoreButton
              onClick={handleShowMore}
              label={showMoreButtonText}
            />
          )}
        </div>
      </div>

      {inactiveCards.length > 0 && (
        <nav className="sr-only" aria-hidden="true">
          {inactiveCards.map((card) => (
            <a key={card.id} href={card.url} tabIndex={-1}>
              {card.title}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
};
