import type { FC } from "react";

import { cn } from "@/shared/lib/utils/cn";

export interface HorizontalTabsItem {
  icon: string;
  label: string;
}

export interface HorizontalTabsProps {
  activeTab?: string | null;
  tabs: HorizontalTabsItem[];
  onClick: (tab: string) => void;
}

export const HorizontalTabs: FC<HorizontalTabsProps> = ({
  activeTab = null,
  tabs,
  onClick,
}) => {
  if (!tabs.length) {
    return null;
  }

  const effectiveActive = activeTab ?? tabs[0].label;

  return (
    <div role="tablist" className="flex w-full items-stretch">
      <div className="flex min-w-0 flex-1 items-stretch gap-1 overflow-x-auto overflow-y-hidden">
        {tabs.map((tab) => {
          const isActive = effectiveActive === tab.label;

          return (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onClick(tab.label)}
              className={cn(
                "flex min-w-0 flex-[1_0_0] cursor-pointer flex-row items-center justify-center gap-1.5 rounded-xl border-none px-3 py-[10px] transition-[background-color,color] duration-150 focus:outline-none focus-visible:shadow-[0_0_0_2px_var(--color-secondary-opacity-24)]",
                isActive
                  ? "bg-[var(--color-secondary-opacity-8)]"
                  : "bg-transparent hover:bg-[rgba(0,0,0,0.06)]"
              )}
            >
              <span
                className={cn(
                  "material-symbols-rounded shrink-0 text-[20px] leading-none",
                  isActive
                    ? "text-[var(--color-secondary)] [font-variation-settings:'FILL'_1,'wght'_400,'GRAD'_0,'opsz'_20]"
                    : "text-[var(--color-text-primary)] [font-variation-settings:'FILL'_0,'wght'_400,'GRAD'_0,'opsz'_20]"
                )}
              >
                {tab.icon}
              </span>
              <span
                className={cn(
                  "shrink-0 overflow-hidden font-[Outfit,sans-serif] text-[18px] leading-5 text-ellipsis whitespace-nowrap",
                  isActive
                    ? "text-[var(--color-secondary)]"
                    : "text-[var(--color-text-primary)]"
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
