import { MAIN_APP_BASE } from "astro:env/client";

import type { ELanguages } from "../../constants/languages";
import { defaultLocale } from "../../config/locale";
import { removeTrailingSlashes } from "../utils/removeTrailingSlashes";

export const getLocalizedPath = (path: string, language: ELanguages) => {
  const isDefaultLocale = language === defaultLocale;

  if (isDefaultLocale) {
    return path;
  }

  if (path.startsWith(MAIN_APP_BASE)) {
    return removeTrailingSlashes(
      path.replace(MAIN_APP_BASE, `${MAIN_APP_BASE}/${language}`)
    );
  }

  return removeTrailingSlashes(`/${language}${path}`);
};
