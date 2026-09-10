import type React from "react";

/**
 * Image loading strategy
 */
export type ImageLoading = "lazy" | "eager";

/**
 * Image decoding hint
 */
export type ImageDecoding = "async" | "sync" | "auto";

/**
 * Image object-fit property
 */
export type ImageObjectFit =
  | "contain"
  | "cover"
  | "fill"
  | "none"
  | "scale-down";

/**
 * Props for the Image component
 */
export interface IImageProps {
  /** The source URL of the image */
  readonly src: string;
  /** Alternative text for accessibility */
  readonly alt: string;
  /** Width of the image (number in pixels or string with units) */
  readonly width?: number | string;
  /** Height of the image (number in pixels or string with units) */
  readonly height?: number | string;
  /** Loading strategy - defaults to 'lazy' */
  readonly loading?: ImageLoading;
  /** Decoding hint - defaults to 'async' */
  readonly decoding?: ImageDecoding;
  /** Object-fit property for sizing behavior */
  readonly objectFit?: ImageObjectFit;
  /** Additional CSS classes */
  readonly className?: string;
  /** Inline styles (use sparingly, prefer className) */
  readonly style?: React.CSSProperties;
  /** Whether to apply draggable="false" - defaults to true */
  readonly preventDrag?: boolean;
  /** Error handler when image fails to load */
  readonly onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  /** Load handler when image successfully loads */
  readonly onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  /** Optional srcSet for responsive images */
  readonly srcSet?: string;
  /** Optional sizes attribute for responsive images */
  readonly sizes?: string;
  /** Test ID for e2e testing */
  readonly "data-testid"?: string;
}
