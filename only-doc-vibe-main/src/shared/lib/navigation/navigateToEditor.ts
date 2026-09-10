import { resolveEditorLocale } from "../../constants/editor-locales";
import type { ELanguages } from "../../constants/languages";
import { localeNavigate } from "./localeNavigate";
import { getCurrentLanguage } from "../translations/getCurrentLanguage";

/**
 * Navigate to the local `/editor` page in the current (or given) language,
 * clamped to a locale the editor actually supports.
 */
export const navigateToEditor = (lang?: ELanguages): void => {
  const locale = resolveEditorLocale(lang ?? getCurrentLanguage());

  localeNavigate("/editor", locale);
};
