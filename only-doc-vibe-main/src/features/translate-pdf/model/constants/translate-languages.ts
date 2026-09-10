import { ELanguages, LANGUAGES_LABELS } from "@/shared/constants/languages";

export interface ITranslateLanguage {
  code: ELanguages;
  label: string;
  flagCode: string;
  francCode: string;
  flagImageUrl?: string;
}

/** Maps language codes to ISO 3166-1 alpha-2 country codes for flag images */
const LANGUAGE_TO_FLAG: Record<ELanguages, string> = {
  [ELanguages.ENGLISH]: "gb",
  [ELanguages.FRENCH]: "fr",
  [ELanguages.GERMAN]: "de",
  [ELanguages.ITALIAN]: "it",
  [ELanguages.JAPANESE]: "jp",
  [ELanguages.SPANISH]: "es",
  [ELanguages.DUTCH]: "nl",
  [ELanguages.PORTUGUESE]: "pt",
  [ELanguages.KOREAN]: "kr",
  [ELanguages.GREEK]: "gr",
  [ELanguages.INDONESIAN]: "id",
  [ELanguages.FILIPINO]: "ph",
  [ELanguages.ARABIC]: "sa",
  [ELanguages.HEBREW]: "il",
  [ELanguages.POLISH]: "pl",
  [ELanguages.TURKISH]: "tr",
  [ELanguages.HINDI]: "in",
  [ELanguages.VIETNAMESE]: "vn",
  [ELanguages.ROMANIAN]: "ro",
  [ELanguages.CZECH]: "cz",
  [ELanguages.SLOVAK]: "sk",
  [ELanguages.MALAY]: "my",
  [ELanguages.THAI]: "th",
  [ELanguages.SWEDISH]: "se",
  [ELanguages.NORWEGIAN]: "no",
  [ELanguages.HUNGARIAN]: "hu",
  [ELanguages.CROATIAN]: "hr",
  [ELanguages.FINNISH]: "fi",
  [ELanguages.DANISH]: "dk",
  [ELanguages.BULGARIAN]: "bg",
};

/** Maps franc ISO 639-3 codes to ELanguages codes */
const FRANC_TO_LANGUAGE: Record<string, ELanguages> = {
  eng: ELanguages.ENGLISH,
  fra: ELanguages.FRENCH,
  deu: ELanguages.GERMAN,
  ita: ELanguages.ITALIAN,
  jpn: ELanguages.JAPANESE,
  spa: ELanguages.SPANISH,
  nld: ELanguages.DUTCH,
  por: ELanguages.PORTUGUESE,
  kor: ELanguages.KOREAN,
  ell: ELanguages.GREEK,
  ind: ELanguages.INDONESIAN,
  ara: ELanguages.ARABIC,
  heb: ELanguages.HEBREW,
  pol: ELanguages.POLISH,
  tur: ELanguages.TURKISH,
  hin: ELanguages.HINDI,
  vie: ELanguages.VIETNAMESE,
  ron: ELanguages.ROMANIAN,
  ces: ELanguages.CZECH,
  slk: ELanguages.SLOVAK,
  msa: ELanguages.MALAY,
  tha: ELanguages.THAI,
  swe: ELanguages.SWEDISH,
  nob: ELanguages.NORWEGIAN,
  nno: ELanguages.NORWEGIAN,
  hun: ELanguages.HUNGARIAN,
  hrv: ELanguages.CROATIAN,
  fin: ELanguages.FINNISH,
  dan: ELanguages.DANISH,
  bul: ELanguages.BULGARIAN,
};

/** Resolves a franc ISO 639-3 code to an ELanguages code, or null */
export const francCodeToLanguage = (
  francCode: string | null
): ELanguages | null => {
  if (!francCode || francCode === "und") return null;

  return FRANC_TO_LANGUAGE[francCode] ?? null;
};

/** All supported languages for translation, sorted alphabetically by label */
export const TRANSLATE_LANGUAGES: ITranslateLanguage[] = Object.values(
  ELanguages
).map((code) => ({
  code,
  label: LANGUAGES_LABELS[code],
  flagCode: LANGUAGE_TO_FLAG[code],
  francCode:
    Object.entries(FRANC_TO_LANGUAGE).find(([, lang]) => lang === code)?.[0] ??
    "",
}));

/** Get the flag image URL for a given country code */
export const getFlagUrl = (flagCode: string): string =>
  `https://flagcdn.com/w40/${flagCode}.png`;

/**
 * Detect the user's preferred language from browser locale.
 * Returns the matching ELanguages code, or null if not supported.
 */
export const detectBrowserLanguage = (): ELanguages | null => {
  try {
    const browserLangs =
      typeof navigator !== "undefined" ? navigator.languages : [];
    for (const locale of browserLangs) {
      const langCode = locale.split("-")[0].toLowerCase();
      const match = Object.values(ELanguages).find((code) => code === langCode);
      if (match) return match;
    }
  } catch {
    // SSR or navigator not available
  }

  return null;
};
