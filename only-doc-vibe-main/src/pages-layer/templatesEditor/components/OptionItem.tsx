import { type FC } from "react";

import { cn } from "@/shared/lib/utils/cn";

import { IconButton } from "../ui/IconButton";

interface OptionItemProps {
  iconName: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export const OptionItem: FC<OptionItemProps> = ({
  iconName,
  label,
  active,
  disabled,
  onClick,
}) => {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={cn(
        "flex flex-[1_0_0] cursor-pointer items-center gap-2",
        disabled && "cursor-not-allowed"
      )}
    >
      <IconButton iconName={iconName} active={active} disabled={disabled} />
      <span
        className={cn(
          "font-[Outfit,sans-serif] text-[16px] leading-[22px] font-normal whitespace-nowrap text-[var(--color-text-primary)]",
          disabled && "opacity-50"
        )}
      >
        {label}
      </span>
    </div>
  );
};
