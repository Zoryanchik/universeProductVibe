import type { TitleVariant } from "./types";

interface VariantClasses {
  readonly mobile: string;
  readonly desktop: string;
}

// Maps variants to Tailwind typography utility classes
export const VARIANT_CLASSES: Record<TitleVariant, VariantClasses> = {
  "desktop-title-1": {
    mobile: "text-mobile-title-1",
    desktop: "lg:text-desktop-title-1",
  },
  "desktop-title-2": {
    mobile: "text-mobile-title-2",
    desktop: "lg:text-desktop-title-2",
  },
  "desktop-title-3": {
    mobile: "text-mobile-title-3",
    desktop: "lg:text-desktop-title-3",
  },
  "desktop-title-4": {
    mobile: "text-mobile-title-4",
    desktop: "lg:text-desktop-title-4",
  },
  "desktop-title-5": {
    mobile: "text-mobile-title-5",
    desktop: "lg:text-desktop-title-5",
  },
  "desktop-title-6": {
    mobile: "text-mobile-title-6",
    desktop: "lg:text-desktop-title-6",
  },
  "mobile-title-1": {
    mobile: "text-mobile-title-1",
    desktop: "",
  },
  "mobile-title-2": {
    mobile: "text-mobile-title-2",
    desktop: "",
  },
  "mobile-title-3": {
    mobile: "text-mobile-title-3",
    desktop: "",
  },
  "mobile-title-4": {
    mobile: "text-mobile-title-4",
    desktop: "",
  },
  "mobile-title-5": {
    mobile: "text-mobile-title-5",
    desktop: "",
  },
  "mobile-title-6": {
    mobile: "text-mobile-title-6",
    desktop: "",
  },
  "leading-desktop": {
    mobile: "text-mobile-leading",
    desktop: "lg:text-desktop-leading",
  },
  "leading-mobile": {
    mobile: "text-mobile-leading",
    desktop: "",
  },
} as const;

export const ALIGNMENT_CLASSES = {
  left: "text-start",
  center: "text-center",
  right: "text-end",
} as const;
