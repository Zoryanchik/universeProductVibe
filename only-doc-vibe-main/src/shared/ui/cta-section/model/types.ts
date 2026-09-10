import type { ReactNode } from "react";

export interface ICTABadge {
  readonly icon: string;
  readonly label: string;
  readonly id: string;
}

export interface ICTASectionData {
  readonly titlePrefix: string;
  readonly titleHighlight: string;
  readonly badges: readonly ICTABadge[];
  readonly buttonLabel: string;
  readonly illustrationSrc: string;
}

export interface ICTASectionProps extends ICTASectionData {
  readonly onButtonClick?: () => void;
}

export interface ICTABadgeProps extends ICTABadge {
  readonly className?: string;
}

export interface ICTAContentProps {
  readonly titlePrefix: string;
  readonly titleHighlight: string;
  readonly badges: readonly ICTABadge[];
}

export interface ICTAButtonProps {
  readonly label: string;
  readonly onClick?: () => void;
  readonly icon?: ReactNode;
}

export interface IUseHighlightWidthReturn {
  readonly highlightRef: React.RefObject<HTMLSpanElement | null>;
  readonly width: number;
}
