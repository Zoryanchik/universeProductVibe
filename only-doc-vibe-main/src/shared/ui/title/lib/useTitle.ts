import { ALIGNMENT_CLASSES, VARIANT_CLASSES } from "../model/constants";
import type { TitleProps, TitleVariant } from "../model/types";

type TitleAlign = NonNullable<TitleProps["align"]>;

interface UseTitleParams {
  readonly variant: TitleVariant;
  readonly align: TitleAlign;
  readonly className: string;
}

interface UseTitleReturn {
  readonly combinedClasses: string;
}

const getTitleClasses = (
  variant: TitleVariant,
  align: TitleAlign,
  className: string
): string => {
  const baseClasses = "font-primary text-text-primary";
  const alignmentClasses = ALIGNMENT_CLASSES[align];
  const variantClasses = VARIANT_CLASSES[variant];

  return [
    baseClasses,
    alignmentClasses,
    variantClasses.mobile,
    variantClasses.desktop,
    className,
  ]
    .filter(Boolean)
    .join(" ");
};

export const useTitle = ({
  variant,
  align,
  className,
}: UseTitleParams): UseTitleReturn => {
  const combinedClasses = getTitleClasses(variant, align, className);

  return { combinedClasses };
};
