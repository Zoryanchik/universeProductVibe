import type React from "react";

import type { EIconId } from "../../../constants/icon-id";

export type ButtonSize = "ms" | "sm" | "md" | "lg";
export type ButtonVariant =
  | "text"
  | "filled"
  | "filled-tonal"
  | "outlined"
  | "upsale";
export type ButtonColor = "primary" | "secondary" | "action" | "error";

export interface IconSize {
  readonly width?: number;
  readonly height?: number;
}

export interface PrimaryButtonProps {
  readonly label: string;
  readonly className?: string;
  readonly buttonClassName?: string;
  readonly wrapperClassName?: string;
  readonly style?: React.CSSProperties;
  readonly onClick?: () => void;
  readonly size?: ButtonSize;
  readonly variant?: ButtonVariant;
  readonly color?: ButtonColor;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly leftIconId?: EIconId;
  readonly rightIconId?: EIconId;
  readonly iconSize?: IconSize;
  readonly showGlow?: boolean;
}
