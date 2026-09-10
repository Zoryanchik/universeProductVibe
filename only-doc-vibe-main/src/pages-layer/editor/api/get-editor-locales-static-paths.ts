import { defaultLocale } from "@/shared/config/locale";
import { EDITOR_SUPPORTED_LOCALES } from "@/shared/constants/editor-locales";

/**
 * Locales served at `/{lang}/editor` (default locale stays `/editor`).
 * Derived from EDITOR_SUPPORTED_LOCALES so routes stay in sync with navigation.
 */
export function getEditorLocalesStaticPaths() {
  return EDITOR_SUPPORTED_LOCALES.filter((lang) => lang !== defaultLocale).map(
    (lang) => ({
      params: { lang },
    })
  );
}
