interface UseSubtitleParams {
  readonly className: string;
}

interface UseSubtitleReturn {
  readonly combinedClasses: string;
}

const getSubtitleClasses = (className: string): string => {
  const baseClasses = "font-primary text-center text-[#020F20]";
  const responsiveClasses = "text-body lg:text-subtitle";

  return [baseClasses, responsiveClasses, className].filter(Boolean).join(" ");
};

export const useSubtitle = ({
  className,
}: UseSubtitleParams): UseSubtitleReturn => {
  const combinedClasses = getSubtitleClasses(className);

  return { combinedClasses };
};
