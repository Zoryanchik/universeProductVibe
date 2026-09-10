import type { FC } from "react";

import { cn } from "@/shared/lib/utils/cn";

interface ToolTabProps {
  activeTab: string | null;
  tab: {
    name: string;
    icon: string;
    label: string;
    isCustomIcon?: boolean;
  };
  onClick: (tabName: string) => void;
}

const ToolTab: FC<ToolTabProps> = ({ activeTab, tab, onClick }) => {
  const active = activeTab === tab.name;

  return (
    <button
      type="button"
      onClick={() => onClick(tab.name)}
      className={cn(
        "flex w-full min-w-[88px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl border-none px-1 py-4 transition-[background-color] duration-150 focus:outline-none",
        active
          ? "bg-[var(--color-secondary-opacity-8)]"
          : "bg-transparent hover:bg-[rgba(0,0,0,0.08)]"
      )}
    >
      {tab.isCustomIcon ? (
        <img
          src={tab.icon}
          alt={tab.label}
          className={cn(
            "h-8 w-8",
            active &&
              "[filter:brightness(0)_saturate(100%)_invert(18%)_sepia(98%)_saturate(7449%)_hue-rotate(258deg)_brightness(97%)_contrast(113%)]"
          )}
        />
      ) : (
        <span
          className={cn(
            "material-symbols-rounded text-[32px]",
            active
              ? "text-[var(--color-secondary)] [font-variation-settings:'FILL'_1,'wght'_300,'GRAD'_0,'opsz'_32]"
              : "text-[rgba(0,0,0,0.87)] [font-variation-settings:'FILL'_0,'wght'_300,'GRAD'_0,'opsz'_32]"
          )}
        >
          {tab.icon}
        </span>
      )}
      <span
        className={cn(
          "w-full overflow-hidden text-center font-[Outfit,sans-serif] text-[14px] leading-[18px] font-normal text-ellipsis whitespace-nowrap",
          active ? "text-[var(--color-secondary)]" : "text-[rgba(0,0,0,0.87)]"
        )}
      >
        {tab.label}
      </span>
    </button>
  );
};

export default ToolTab;
