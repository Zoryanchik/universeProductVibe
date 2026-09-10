import type { FC } from "react";

import { cn } from "../../../lib/utils/cn";
import type { IImageProps } from "../model/types";

/**
 * A reusable Image component with sensible defaults for performance and accessibility.
 *
 * Defaults:
 * - loading="lazy" for performance
 * - decoding="async" for non-blocking decode
 * - draggable="false" to prevent accidental dragging
 *
 * @example
 * // Basic usage
 * <Image src="/logo.png" alt="Company Logo" />
 *
 * @example
 * // With dimensions
 * <Image src="/hero.jpg" alt="Hero image" width={800} height={400} />
 *
 * @example
 * // With object-fit
 * <Image src="/avatar.jpg" alt="User avatar" objectFit="cover" className="rounded-full" />
 *
 * @example
 * // Eager loading for above-the-fold images
 * <Image src="/hero.jpg" alt="Hero" loading="eager" />
 */
export const Image: FC<IImageProps> = ({
  src,
  alt,
  width,
  height,
  loading = "lazy",
  decoding = "async",
  objectFit,
  className,
  style,
  preventDrag = true,
  onError,
  onLoad,
  srcSet,
  sizes,
  "data-testid": dataTestId,
}) => {
  const imageClasses = cn(
    // Base styles
    "max-w-full",
    // Object-fit
    objectFit === "contain" && "object-contain",
    objectFit === "cover" && "object-cover",
    objectFit === "fill" && "object-fill",
    objectFit === "none" && "object-none",
    objectFit === "scale-down" && "object-scale-down",
    // Custom className
    className
  );

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      className={imageClasses}
      style={style}
      draggable={preventDrag ? false : undefined}
      onError={onError}
      onLoad={onLoad}
      srcSet={srcSet}
      sizes={sizes}
      data-testid={dataTestId}
    />
  );
};
