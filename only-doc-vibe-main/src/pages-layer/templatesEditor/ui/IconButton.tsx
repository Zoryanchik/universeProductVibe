import type { FC, MouseEvent } from "react";

import { cn } from "@/shared/lib/utils/cn";

interface IconButtonProps {
  iconName: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  size?: "medium" | "large";
}

const ACTIVE_SHADOW =
  "shadow-[0_0_0_4px_var(--color-primary-opacity-12),inset_0_1px_4px_0_var(--color-primary-opacity-24),inset_0_-1px_4px_0_var(--color-primary-opacity-24)]";

export const IconButton: FC<IconButtonProps> = ({
  iconName,
  onClick,
  className,
  active,
  disabled,
  size = "medium",
}) => {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  const isActive = active && !disabled;

  return (
    <button
      type="button"
      className={cn(
        "group flex items-center justify-center rounded-lg border border-[var(--color-action-stroke)] bg-[var(--color-bg-white-bg)] p-2 outline-none",
        size === "medium" ? "h-10 w-10" : "h-11 w-11",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:border-[var(--color-primary-opacity-50)] hover:bg-[var(--color-primary-opacity-12)]",
        isActive &&
          cn(
            "border-[var(--color-primary-opacity-50)] bg-[var(--color-primary-opacity-12)]",
            ACTIVE_SHADOW
          ),
        className
      )}
      aria-label={iconName}
      onClick={handleClick}
    >
      <span
        className={cn(
          "material-symbols-rounded text-2xl text-[#323232] [font-variation-settings:'FILL'_0,'wght'_300,'GRAD'_0,'opsz'_24]",
          !disabled && "group-hover:text-[var(--color-primary)]",
          isActive && "text-[var(--color-primary)]"
        )}
      >
        {iconName}
      </span>
    </button>
  );
};
