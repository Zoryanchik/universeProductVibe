import { navigate } from "astro:transitions/client";
import { MAIN_APP_BASE } from "astro:env/client";

import type { ELanguages } from "../../constants/languages";
import { getLocalizedPath } from "./getLocalizedPath";
import { getCurrentLanguage } from "../translations/getCurrentLanguage";
import { getIsClient } from "../utils/getIsClient";

export const localeNavigate = (
  path: string,
  lang: ELanguages = getCurrentLanguage()
) => {
  const localizedPath = getLocalizedPath(path, lang);

  if (path.startsWith(MAIN_APP_BASE) && getIsClient()) {
    return navigateToMainApp(localizedPath);
  }

  return navigate(localizedPath);
};

function navigateToMainApp(path: string) {
  window.location.replace(path);
}
