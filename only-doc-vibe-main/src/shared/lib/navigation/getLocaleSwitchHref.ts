import type { ELanguages } from "../../constants/languages";
import { getLocalizedPath } from "./getLocalizedPath";
import { getPathWithoutLocale } from "./getPathWithoutLocale";

/**
 * Compute the URL for switching the current page to a different locale.
 *
 * Used both for SSR-rendered <a href> on language switchers (so crawlers can
 * see the alternate URLs) and for runtime navigation, ensuring both paths
 * agree on the same target.
 *
 * When `pageLocalizations` is provided, the function falls back to the
 * target locale's home (`/` localized to that locale) for any locale the
 * current page hasn't been translated into, instead of producing a link to
 * a path that would 404 in the target locale. Pass `undefined` (the default)
 * to keep the previous behavior of always preserving the current path.
 */
export const getLocaleSwitchHref = (
  pathname: string,
  currentLang: ELanguages,
  targetLang: ELanguages,
  pageLocalizations?: ELanguages[]
): string => {
  if (
    pageLocalizations &&
    targetLang !== currentLang &&
    !pageLocalizations.includes(targetLang)
  ) {
    return getLocalizedPath("/", targetLang);
  }

  const basePath = getPathWithoutLocale(pathname, currentLang);

  return getLocalizedPath(basePath, targetLang);
};
