import { useMemo } from "react";

interface UseBottomCtaStylesReturn {
  readonly outerContainerClassName: string;
  readonly innerContainerClassName: string;
  readonly titleSubtitleWrapperClassName: string;
  readonly titleClassName: string;
  readonly subtitleClassName: string;
  readonly buttonWrapperClassName: string;
}

export const useBottomCtaStyles = (): UseBottomCtaStylesReturn => {
  const styles = useMemo(
    () => ({
      outerContainerClassName: [
        "flex flex-col items-center justify-center self-stretch",
        "rounded-[40px] p-4",
        "lg:rounded-[60px] lg:p-8",
        "bg-[linear-gradient(rgba(3,143,123,0.08),rgba(3,143,123,0.08)),linear-gradient(#FFFFFF,#FFFFFF)]",
        "backdrop-blur-[40px]",
      ].join(" "),
      innerContainerClassName: [
        "flex flex-col items-center justify-center self-stretch",
        "gap-12 p-8",
        "rounded-[28px]",
        "lg:rounded-[40px]",
        "border-2 border-dashed border-[rgba(3,143,123,0.2)]",
      ].join(" "),
      titleSubtitleWrapperClassName: [
        "flex flex-col items-center justify-center self-stretch",
        "gap-2",
        "lg:gap-5",
      ].join(" "),
      titleClassName: ["text-center text-[rgba(0,0,0,0.87)]"].join(" "),
      subtitleClassName: [
        "text-center text-[rgba(0,0,0,0.87)]",
        "text-subtitle",
      ].join(" "),
      buttonWrapperClassName: ["w-full", "lg:w-[320px]"].join(" "),
    }),
    []
  );

  return styles;
};
