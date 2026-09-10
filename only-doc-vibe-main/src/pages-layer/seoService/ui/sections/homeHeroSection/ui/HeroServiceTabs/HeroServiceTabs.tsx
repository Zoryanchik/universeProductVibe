"use client";

import { type FC, useState, useCallback, useRef, useEffect } from "react";

import { cn } from "@/shared/lib/utils/cn";
import { EAnalyticsEvents, trackEvent } from "@/shared/lib/analytics";
import { Image } from "@/shared/ui/image";

import type { IHeroServiceTabsProps } from "./types";

export const HeroServiceTabs: FC<IHeroServiceTabsProps> = ({
  tabs,
  onTabChange,
  defaultTabId,
}) => {
  const [activeTabId, setActiveTabId] = useState<string>(
    defaultTabId ?? tabs[0]?.id ?? ""
  );

  const scrollPositionRef = useRef<number>(0);
  const isChangingTabRef = useRef<boolean>(false);

  const handleTabClick = useCallback(
    (tabId: string): void => {
      scrollPositionRef.current = window.scrollY;
      isChangingTabRef.current = true;

      trackEvent(EAnalyticsEvents.CATEGORIES_BAR_TAP, { category: tabId });

      setActiveTabId(tabId);
      onTabChange?.(tabId);
    },
    [onTabChange]
  );

  useEffect(() => {
    if (isChangingTabRef.current) {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: "instant" as ScrollBehavior,
        });
        isChangingTabRef.current = false;
      });
    }
  }, [activeTabId]);

  return (
    <div className="flex flex-wrap justify-center gap-1">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "text-body flex cursor-pointer items-center gap-2 rounded-xl px-3 py-3 font-medium transition-colors duration-150",
              isActive
                ? "bg-[var(--color-action-main)] text-[var(--color-action-contrast-text)]"
                : "border border-[var(--color-action-stroke)] bg-transparent hover:bg-[var(--color-state-action-hover)]"
            )}
          >
            {tab.iconUrl && (
              <Image
                src={tab.iconUrl}
                alt=""
                className={cn(
                  "h-5 w-5",
                  isActive ? "brightness-0 invert" : "opacity-60 brightness-0"
                )}
              />
            )}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
