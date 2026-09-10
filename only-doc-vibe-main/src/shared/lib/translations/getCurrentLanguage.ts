import { defaultLocale } from "../../config/locale";
import type { ELanguages } from "../../constants/languages";
import { isELanguage } from "../../constants/languages";

export const getCurrentLanguage = (pathanme?: string): ELanguages => {
  const windowPathname =
    typeof window !== "undefined" ? window.location.pathname : "";
  const path = pathanme || windowPathname || "";

  const langPart = (() => {
    const pathParts = path.split("/");
    const secondPart = pathParts[1];

    return secondPart;
  })();

  if (isELanguage(langPart)) {
    return langPart;
  }

  return defaultLocale;
};
