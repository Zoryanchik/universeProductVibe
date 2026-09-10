import type { ELanguages } from "@/shared/constants/languages";
import { availableLocales } from "@/shared/config/locale";
import { navigateThroughURL } from "@/shared/lib/seo/navigate-through-url";
import { isELanguage } from "@/shared/constants/languages";

import type { IFooterData, IFooterLogo } from "../model/types";

interface UseFooterProps {
  readonly data?: IFooterData;
  readonly currentLang: ELanguages;
}

interface UseFooterReturn {
  readonly logo: IFooterLogo | undefined;
  readonly hasData: boolean;
  readonly availableLanguages: ELanguages[];
  readonly handleLogoClick: () => void;
}

/**
 * Hook for Footer component logic
 * Extracts business logic from the UI component
 */
export const useFooter = ({
  data,
  currentLang,
}: UseFooterProps): UseFooterReturn => {
  const logo = data?.logo?.[0];
  const hasData = Boolean(data);
  const localesFromCms =
    data?.localizations
      ?.map((item) => item.locale)
      .filter((locale): locale is ELanguages => isELanguage(locale)) ?? [];
  const availableLanguages = [
    currentLang,
    ...localesFromCms,
    ...availableLocales,
  ].filter((locale, index, arr) => arr.indexOf(locale) === index);

  const handleLogoClick = (): void => {
    const homeUrl = navigateThroughURL("/", currentLang);
    window.location.href = homeUrl;
  };

  return {
    logo,
    hasData,
    availableLanguages,
    handleLogoClick,
  };
};
