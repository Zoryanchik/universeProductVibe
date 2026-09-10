import type { FC } from "react";
import { WEB_HOST } from "astro:env/client";

import { cn } from "../../../lib/utils/cn";
import type { ILinkProps, LinkSize, LinkVariant } from "../model/types";

/**
 * Default configuration for the Link component
 */
const DEFAULT_VARIANT: LinkVariant = "common";
const DEFAULT_SIZE: LinkSize = "md";

/**
 * Size-to-class mapping for link text sizes
 */
const SIZE_CLASSES: Readonly<Record<LinkSize, string>> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
} as const;

/**
 * Variant-to-class mapping for link colors
 */
const VARIANT_CLASSES: Readonly<Record<LinkVariant, string>> = {
  primary: "hover:text-blue-800",
  secondary: "hover:text-white",
  tertiary: "hover:text-slate-900",
  "primary-contrast": "hover:text-blue-900",
  common: "hover:text-slate-900",
  unstyled: "",
} as const;

/**
 * A reusable Link component with multiple variants and sizes.
 * Supports disabled states, loading states, and external links.
 *
 * @example
 * // Basic usage
 * <Link href="/about">About Us</Link>
 *
 * @example
 * // With variant and size
 * <Link href="/pricing" variant="primary" size="lg">View Pricing</Link>
 *
 * @example
 * // External link
 * <Link href="https://example.com" external>Visit Site</Link>
 */
export const Link: FC<ILinkProps> = ({
  href,
  children,
  variant = DEFAULT_VARIANT,
  size = DEFAULT_SIZE,
  disabled = false,
  loading = false,
  className,
  onClick,
  external = false,
  ariaLabel,
  title,
  "data-testid": dataTestId,
}) => {
  const isDisabled = disabled || loading;
  const isAbsoluteHttp = /^https?:\/\//i.test(href);
  const isMailOrPhone = /^(mailto:|tel:)/i.test(href);

  const isInternalAbsoluteLink = (() => {
    if (!isAbsoluteHttp) return false;

    try {
      const url = new URL(href);
      const normalizedHost = WEB_HOST.toLowerCase();
      // url.host includes the port (e.g. "localhost:4322"), url.hostname doesn't
      // WEB_HOST also includes the port when configured, so compare against host
      // prevents internal CMS links from opening in a new tab
      const host = url.host.toLowerCase();
      const hostname = url.hostname.toLowerCase();

      return (
        host === normalizedHost ||
        hostname === normalizedHost ||
        host.endsWith(`.${normalizedHost}`) ||
        hostname.endsWith(`.${normalizedHost}`)
      );
    } catch {
      return false;
    }
  })();

  const isExternalLink =
    external || (isAbsoluteHttp && !isInternalAbsoluteLink);

  const linkClasses = cn(
    // Core link design system: color, font, underline always applied
    "inline-flex items-center font-medium no-underline transition-colors duration-200 decoration-[currentColor] underline-offset-4 [&_*]:cursor-pointer leading-[1.3] cursor-pointer",
    // Size
    SIZE_CLASSES[size],
    // Only variant hover color (color always text-secondary-filled-500 )
    !isDisabled && VARIANT_CLASSES[variant],
    // Disabled state
    isDisabled && "pointer-events-none cursor-not-allowed",
    // Custom className
    className
  );

  const externalProps = isExternalLink
    ? {
        target: "_blank" as const,
        rel: "nofollow noopener noreferrer",
      }
    : {};

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>): void => {
    if (isDisabled) {
      event.preventDefault();

      return;
    }

    onClick?.(event);
  };

  return (
    <a
      href={href}
      className={linkClasses}
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-disabled={isDisabled}
      data-external-link={isExternalLink && !isMailOrPhone ? "true" : undefined}
      data-testid={dataTestId}
      title={title}
      {...externalProps}
    >
      {children}
    </a>
  );
};
