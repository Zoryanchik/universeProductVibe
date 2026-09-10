import { useState, useCallback, useRef } from "react";

import type { EServiceTabId } from "@/shared/constants/service-tabs";

import { DEFAULT_SERVICE_TAB_ID } from "../../../model/constants";

interface UseHeroServiceSectionReturn {
  readonly activeCategory: EServiceTabId;
  readonly contentRef: React.RefObject<HTMLDivElement | null>;
  readonly handleTabChange: (tabId: string) => void;
}

export const useHeroServiceSection = (): UseHeroServiceSectionReturn => {
  const [activeCategory, setActiveCategory] = useState<EServiceTabId>(
    DEFAULT_SERVICE_TAB_ID
  );

  // Ref to prevent scroll jumps during content changes
  const contentRef = useRef<HTMLDivElement | null>(null);
  const scrollPositionRef = useRef<number>(0);

  const handleTabChange = useCallback((tabId: string): void => {
    // Store current scroll position
    scrollPositionRef.current = window.scrollY;

    // Prevent any focus-related scroll behavior
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setActiveCategory(tabId as EServiceTabId);

    // Restore scroll position after state update
    requestAnimationFrame(() => {
      window.scrollTo({
        top: scrollPositionRef.current,
        behavior: "instant" as ScrollBehavior,
      });
    });
  }, []);

  return {
    activeCategory,
    contentRef,
    handleTabChange,
  };
};
