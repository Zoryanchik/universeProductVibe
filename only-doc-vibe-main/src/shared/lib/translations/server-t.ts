import AR_TRANSLATIONS from "@public/locales/ar/translation.json";
import DE_TRANSLATIONS from "@public/locales/de/translation.json";
import EN_TRANSLATIONS from "@public/locales/en/translation.json";
import ES_TRANSLATIONS from "@public/locales/es/translation.json";
import FR_TRANSLATIONS from "@public/locales/fr/translation.json";
import ID_TRANSLATIONS from "@public/locales/id/translation.json";
import PL_TRANSLATIONS from "@public/locales/pl/translation.json";
import PT_TRANSLATIONS from "@public/locales/pt/translation.json";

import { ELanguages } from "../../constants/languages";
import { createT } from "./createT";
import type { TFunction } from "./types";

// Only include languages that exist in SEO locales directory
const _SEO_LANGUAGES = [
  ELanguages.ENGLISH,
  ELanguages.PORTUGUESE,
  ELanguages.SPANISH,
  ELanguages.INDONESIAN,
  ELanguages.ARABIC,
  ELanguages.FRENCH,
  ELanguages.GERMAN,
  ELanguages.POLISH,
] as const;

type SEOLanguage = (typeof _SEO_LANGUAGES)[number];

const TRANSLATIONS: Record<SEOLanguage, Record<string, unknown>> = {
  [ELanguages.ENGLISH]: EN_TRANSLATIONS,
  [ELanguages.PORTUGUESE]: PT_TRANSLATIONS,
  [ELanguages.SPANISH]: ES_TRANSLATIONS,
  [ELanguages.INDONESIAN]: ID_TRANSLATIONS,
  [ELanguages.ARABIC]: AR_TRANSLATIONS,
  [ELanguages.FRENCH]: FR_TRANSLATIONS,
  [ELanguages.GERMAN]: DE_TRANSLATIONS,
  [ELanguages.POLISH]: PL_TRANSLATIONS,
};

// Export the translation type for type inference
export type TranslationSchema = typeof EN_TRANSLATIONS;

export function createServerT(
  language: ELanguages
): TFunction<TranslationSchema> {
  // Check if the language exists in SEO translations, fallback to default if not
  const translations =
    language in TRANSLATIONS
      ? TRANSLATIONS[language as SEOLanguage]
      : TRANSLATIONS[ELanguages.ENGLISH];

  return createT(
    translations,
    language,
    TRANSLATIONS[ELanguages.ENGLISH]
  ) as TFunction<TranslationSchema>;
}
