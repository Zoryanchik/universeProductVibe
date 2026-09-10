import type { FC, MouseEventHandler, ReactNode } from "react";

import { cn } from "@/shared/lib/utils/cn";

export type ButtonSize = "md" | "lg";
export type ButtonVariant = "filled" | "outlined";
export type ButtonColorType = "primary" | "secondary";

interface ButtonProps {
  children: ReactNode;
  icon?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  colorType?: ButtonColorType;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  minWidth?: number;
}

const sizeStyles: Record<ButtonSize, string> = {
  md: "px-6 py-3 rounded-xl h-12 w-full",
  lg: "px-4 py-3 rounded-[16px_12px_16px_16px] w-full h-14",
};

const buttonVariantStyles: Record<
  ButtonVariant,
  Record<ButtonColorType, string>
> = {
  filled: {
    primary:
      "bg-[var(--color-secondary)] border-none enabled:hover:opacity-[0.92] disabled:bg-[var(--color-action-disabled-bg)]",
    secondary:
      "bg-[rgba(0,0,0,0.87)] border-none enabled:hover:opacity-[0.92] disabled:bg-[var(--color-action-disabled-bg)]",
  },
  outlined: {
    primary:
      "bg-transparent border-2 border-[var(--color-secondary-opacity-50)] enabled:hover:bg-[var(--color-secondary-opacity-8)] enabled:hover:border-[var(--color-secondary-dark)] disabled:bg-[var(--color-action-disabled-bg)] disabled:border-none",
    secondary:
      "bg-transparent border-2 border-[var(--color-common-black)] enabled:hover:bg-[rgba(0,0,0,0.04)] disabled:bg-[var(--color-action-disabled-bg)] disabled:border-none",
  },
};

const labelVariantStyles: Record<
  ButtonVariant,
  Record<ButtonColorType, string>
> = {
  filled: {
    primary:
      "text-[var(--color-secondary-contrast-text)] group-disabled:text-[var(--color-action-disabled)]",
    secondary: "text-white group-disabled:text-[var(--color-action-disabled)]",
  },
  outlined: {
    primary:
      "text-[var(--color-secondary)] group-enabled:group-hover:text-[var(--color-secondary-dark)] group-disabled:text-[var(--color-action-disabled)]",
    secondary:
      "text-[var(--color-common-black)] group-disabled:text-[var(--color-action-disabled)]",
  },
};

export const Button: FC<ButtonProps> = ({
  children,
  icon,
  size = "md",
  variant = "filled",
  colorType = "primary",
  disabled,
  onClick,
  className,
  minWidth = 153,
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    style={{ minWidth }}
    className={cn(
      "group flex cursor-pointer items-center justify-center gap-2 disabled:cursor-not-allowed",
      buttonVariantStyles[variant][colorType],
      sizeStyles[size],
      className
    )}
  >
    <span
      className={cn(
        "font-[Outfit,sans-serif] text-[18px] leading-6 font-medium whitespace-nowrap",
        labelVariantStyles[variant][colorType]
      )}
    >
      {children}
    </span>
    {icon && (
      <span
        className={cn(
          "material-symbols-rounded w-[18px] overflow-hidden text-2xl [font-variation-settings:'FILL'_0,'wght'_400,'GRAD'_0,'opsz'_24]",
          labelVariantStyles[variant][colorType]
        )}
      >
        {icon}
      </span>
    )}
  </button>
);
