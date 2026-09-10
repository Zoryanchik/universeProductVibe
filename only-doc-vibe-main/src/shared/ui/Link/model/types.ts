import type React from "react";

/**
 * Link variant types for different visual styles
 */
export type LinkVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "primary-contrast"
  | "common"
  | "unstyled";

/**
 * Link size options
 */
export type LinkSize = "sm" | "md" | "lg";

/**
 * Props for the Link component
 */
export interface ILinkProps {
  /** The URL to navigate to */
  readonly href: string;
  /** Content to render inside the link */
  readonly children: React.ReactNode;
  /** Visual variant of the link */
  readonly variant?: LinkVariant;
  /** Size of the link text */
  readonly size?: LinkSize;
  /** Whether the link is disabled */
  readonly disabled?: boolean;
  /** Whether to show loading state */
  readonly loading?: boolean;
  /** Additional CSS classes */
  readonly className?: string;
  /** Click handler */
  readonly onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  /** Whether to open in a new tab */
  readonly external?: boolean;
  /** Custom aria-label for accessibility */
  readonly ariaLabel?: string;
  /** Title attribute for tooltip */
  readonly title?: string;
  /** Test ID for e2e testing */
  readonly "data-testid"?: string;
}
