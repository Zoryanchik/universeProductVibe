import { type FC } from "react";

import { cn } from "@/shared/lib/utils/cn";

export type ImageFilterVariant =
  | "cold"
  | "warm"
  | "sepia"
  | "grayscale"
  | "natural";

const VARIANT_LABELS: Record<ImageFilterVariant, string> = {
  cold: "Cold",
  warm: "Warm",
  sepia: "Sepia",
  grayscale: "Grayscale",
  natural: "Natural",
};

const VARIANT_FILTER_CLASSES: Record<ImageFilterVariant, string> = {
  cold: "[filter:saturate(0.8)_hue-rotate(20deg)_brightness(1.1)]",
  warm: "[filter:sepia(0.3)_saturate(1.3)_brightness(1.05)]",
  sepia: "[filter:sepia(0.8)]",
  grayscale: "[filter:grayscale(1)]",
  natural: "[filter:none]",
};

interface ImageVariantProps {
  src: string;
  variant: ImageFilterVariant;
  onClick: () => void;
  selected?: boolean;
}

export const ImageVariant: FC<ImageVariantProps> = ({
  src,
  variant,
  onClick,
  selected,
}) => {
  return (
    <button
      onClick={onClick}
      className="flex cursor-pointer flex-col items-center gap-1 border-none bg-none p-0"
    >
      <div
        className={cn(
          "relative aspect-square w-full overflow-hidden rounded-[var(--corner-radius-4,12px)] border border-[var(--color-action-stroke)]",
          selected && "border-2 border-[var(--color-primary)]"
        )}
      >
        <img
          src={src}
          alt={VARIANT_LABELS[variant]}
          className={cn(
            "h-full w-full object-cover",
            VARIANT_FILTER_CLASSES[variant]
          )}
        />
      </div>
      <span className="text-center font-[Outfit,sans-serif] text-[18px] leading-5 font-semibold text-[var(--color-text-primary)]">
        {VARIANT_LABELS[variant]}
      </span>
    </button>
  );
};
