import type { FC, MouseEventHandler } from "react";

interface ToolButtonProps {
  icon: string;
  label: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export const ToolButton: FC<ToolButtonProps> = ({
  icon,
  label,
  onClick,
  disabled,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex min-w-[52px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border-none bg-none px-2 py-1 enabled:hover:bg-[rgba(0,0,0,0.04)] disabled:cursor-not-allowed disabled:opacity-40"
  >
    <span className="material-symbols-rounded text-2xl text-[var(--color-text-primary)] [font-variation-settings:'FILL'_0,'wght'_300,'GRAD'_0,'opsz'_24]">
      {icon}
    </span>
    <span className="text-center font-[Outfit,sans-serif] text-[14px] leading-[18px] font-normal whitespace-nowrap text-[var(--color-text-primary)]">
      {label}
    </span>
  </button>
);
