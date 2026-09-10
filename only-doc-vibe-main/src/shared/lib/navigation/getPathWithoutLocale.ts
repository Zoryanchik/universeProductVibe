import { defaultLocale } from "../../config/locale";
import type { ELanguages } from "../../constants/languages";

export const getPathWithoutLocale = (path: string, lang: ELanguages) => {
  if (lang === defaultLocale) {
    return path;
  }

  const escapedLang = lang.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const stripped = path.replace(new RegExp(`^/${escapedLang}(?=/|$)`), "");

  return stripped || "/";
};
