import type { FC } from "react";

import { cn } from "@/shared/lib/utils/cn";
import { useTranslation } from "@/shared/lib/translations";

interface PagesButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const PagesButton: FC<PagesButtonProps> = ({ isOpen, onToggle }) => {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isOpen}
      className={cn(
        "group flex cursor-pointer items-center justify-center gap-[2px] rounded-lg border-none p-2 outline-none",
        "shadow-[0px_6px_12px_-2px_rgba(0,0,0,0.08),0px_8px_40px_rgba(0,0,0,0.08)]",
        "hover:bg-[var(--color-primary-opacity-12)]",
        isOpen
          ? "bg-[var(--color-primary-opacity-12)] shadow-[0px_0px_0px_4px_var(--color-primary-opacity-12),inset_0px_1px_4px_0px_var(--color-primary-opacity-24),inset_0px_-1px_4px_0px_var(--color-primary-opacity-24)]"
          : "bg-[var(--color-bg-white-bg)]"
      )}
    >
      <span
        className={cn(
          "material-symbols-rounded text-2xl [font-variation-settings:'FILL'_0,'wght'_300,'GRAD'_0,'opsz'_24]",
          "text-[var(--color-common-black)] group-hover:text-[var(--color-primary)]",
          isOpen && "text-[var(--color-primary)]"
        )}
      >
        description
      </span>
      <span
        className={cn(
          "w-12 overflow-hidden text-start font-[Outfit,sans-serif] text-[16px] leading-[22px] font-normal text-ellipsis whitespace-nowrap",
          "text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)]",
          isOpen && "text-[var(--color-primary)]"
        )}
      >
        {t("templatesEditor.ui.pages") as string}
      </span>
    </button>
  );
};
