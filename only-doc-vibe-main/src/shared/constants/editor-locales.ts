import { availableLocales, defaultLocale } from "../config/locale";
import type { ELanguages } from "./languages";

/**
 * Locales the editor is served in. Kept in sync with the site's availableLocales
 * so `/{lang}/editor` routes and the `editor_page` translations stay aligned
 * (default locale stays at `/editor`).
 */
export const EDITOR_SUPPORTED_LOCALES: ELanguages[] = availableLocales;

export const isEditorSupportedLocale = (lang: ELanguages): boolean =>
  EDITOR_SUPPORTED_LOCALES.includes(lang);

/** Clamp any language to one the editor actually supports (falls back to default). */
export const resolveEditorLocale = (lang: ELanguages): ELanguages =>
  isEditorSupportedLocale(lang) ? lang : defaultLocale;
