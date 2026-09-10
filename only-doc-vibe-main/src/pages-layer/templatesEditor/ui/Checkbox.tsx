import type { FC, MouseEvent } from "react";

import { cn } from "@/shared/lib/utils/cn";

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  compact?: boolean;
  label?: string;
}

export const Checkbox: FC<CheckboxProps> = ({
  checked = false,
  onChange,
  className,
  compact,
  label,
}) => {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange?.(!checked);
  };

  const hasLabel = !!label;

  return (
    <label
      className={cn(
        "box-border flex cursor-pointer items-center rounded-xl",
        hasLabel ? "justify-start gap-2" : "justify-center gap-0",
        hasLabel || compact ? "h-auto w-auto" : "h-10 w-10",
        compact ? "p-0" : "p-[10px]",
        className
      )}
      onClick={handleClick}
    >
      <input
        type="checkbox"
        checked={checked}
        readOnly
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />
      <div className="box-border flex h-5 w-5 items-center justify-center rounded bg-[var(--color-bg-light-grey,#f5f5f7)]">
        <div
          className={cn(
            "box-border h-full w-full rounded border-2 border-[rgba(71,71,71,0.8)]",
            checked ? "hidden" : "block"
          )}
        />
        <div
          className={cn(
            "h-full w-full items-center justify-center rounded bg-[var(--color-primary)] text-white",
            checked ? "flex" : "hidden"
          )}
        >
          <span className="material-symbols-rounded text-[14px] [font-variation-settings:'FILL'_1,'wght'_600,'GRAD'_0,'opsz'_14]">
            check
          </span>
        </div>
      </div>
      {label && (
        <span className="font-[Outfit,sans-serif] text-[18px] leading-[26px] font-normal whitespace-nowrap text-[var(--color-text-primary,rgba(0,0,0,0.87))] select-none">
          {label}
        </span>
      )}
    </label>
  );
};
