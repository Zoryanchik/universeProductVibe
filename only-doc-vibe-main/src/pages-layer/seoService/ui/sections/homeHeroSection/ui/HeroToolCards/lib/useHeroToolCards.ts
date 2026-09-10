import { useMemo, useState, useCallback, useEffect } from "react";

import type { EServiceTabId, IToolCard } from "@/shared/constants/service-tabs";

const INITIAL_VISIBLE_MOBILE = 8;

interface UseHeroToolCardsParams {
  readonly cards: readonly IToolCard[];
  readonly activeCategory: EServiceTabId;
}

interface UseHeroToolCardsReturn {
  readonly filteredCards: readonly IToolCard[];
  readonly isExpanded: boolean;
  readonly showMoreButton: boolean;
  readonly rowsLg: readonly (readonly IToolCard[])[];
  readonly handleShowMore: () => void;
  readonly getCardVisibility: (cardIndex: number) => {
    readonly isHiddenOnSmall: boolean;
    readonly isHiddenOnTablet: boolean;
  };
}

export const useHeroToolCards = ({
  cards,
  activeCategory,
}: UseHeroToolCardsParams): UseHeroToolCardsReturn => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    setIsExpanded(false);
  }, [activeCategory]);

  const filteredCards = useMemo<readonly IToolCard[]>(
    () => cards.filter((card) => card.category === activeCategory),
    [cards, activeCategory]
  );

  const handleShowMore = useCallback((): void => {
    setIsExpanded(true);
  }, []);

  const showMoreButton = useMemo<boolean>(
    () => !isExpanded && filteredCards.length > INITIAL_VISIBLE_MOBILE,
    [isExpanded, filteredCards.length]
  );

  const rowsLg = useMemo<readonly (readonly IToolCard[])[]>(() => {
    const rows: IToolCard[][] = [];

    for (let i = 0; i < filteredCards.length; i += 4) {
      rows.push(filteredCards.slice(i, i + 4));
    }

    return rows;
  }, [filteredCards]);

  const getCardVisibility = useCallback(
    (cardIndex: number) => ({
      isHiddenOnSmall: !isExpanded && cardIndex >= INITIAL_VISIBLE_MOBILE,
      isHiddenOnTablet: !isExpanded && cardIndex >= INITIAL_VISIBLE_MOBILE,
    }),
    [isExpanded]
  );

  return {
    filteredCards,
    isExpanded,
    showMoreButton,
    rowsLg,
    handleShowMore,
    getCardVisibility,
  };
};
