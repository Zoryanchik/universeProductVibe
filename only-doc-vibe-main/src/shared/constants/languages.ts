export enum ELanguages {
  ENGLISH = "en",
  FRENCH = "fr",
  GERMAN = "de",
  ITALIAN = "it",
  JAPANESE = "ja",
  SPANISH = "es",
  DUTCH = "nl",
  PORTUGUESE = "pt",
  KOREAN = "ko",
  GREEK = "el",
  INDONESIAN = "id",
  FILIPINO = "fil",
  ARABIC = "ar",
  HEBREW = "he",
  POLISH = "pl",
  TURKISH = "tr",
  HINDI = "hi",
  VIETNAMESE = "vi",
  ROMANIAN = "ro",
  CZECH = "cs",
  SLOVAK = "sk",
  MALAY = "ms",
  THAI = "th",
  SWEDISH = "sv",
  NORWEGIAN = "no",
  HUNGARIAN = "hu",
  CROATIAN = "hr",
  FINNISH = "fi",
  DANISH = "da",
  BULGARIAN = "bg",
}

export const ALL_LANGUAGES = Object.values(ELanguages);

export const RTL_LANGUAGES = [ELanguages.ARABIC, ELanguages.HEBREW];

export const getIsRTL = (language: ELanguages): boolean => {
  return RTL_LANGUAGES.includes(language);
};

export const isELanguage = (language: unknown): language is ELanguages => {
  return Object.values(ELanguages).includes(language as ELanguages);
};

export const LANGUAGES_LABELS: Record<ELanguages, string> = {
  [ELanguages.ENGLISH]: "English",
  [ELanguages.FRENCH]: "Français",
  [ELanguages.GERMAN]: "Deutsch",
  [ELanguages.ITALIAN]: "Italiana",
  [ELanguages.SPANISH]: "Español",
  [ELanguages.GREEK]: "Ελληνικά",
  [ELanguages.PORTUGUESE]: "Português",
  [ELanguages.JAPANESE]: "日本語",
  [ELanguages.POLISH]: "Polski",
  [ELanguages.TURKISH]: "Türkçe",
  [ELanguages.KOREAN]: "한국어",
  [ELanguages.VIETNAMESE]: "Tiếng Việt",
  [ELanguages.FILIPINO]: "Filipino",
  [ELanguages.DUTCH]: "Nederlands",
  [ELanguages.ROMANIAN]: "Română",
  [ELanguages.INDONESIAN]: "Indonesia",
  [ELanguages.HEBREW]: "עברית",
  [ELanguages.ARABIC]: "العربية",
  [ELanguages.HINDI]: "हिंदी",
  [ELanguages.CZECH]: "Čeština",
  [ELanguages.MALAY]: "Bahasa Melayu",
  [ELanguages.THAI]: "ไทย",
  [ELanguages.SWEDISH]: "Svenska",
  [ELanguages.NORWEGIAN]: "Norsk",
  [ELanguages.HUNGARIAN]: "Magyar",
  [ELanguages.CROATIAN]: "Hrvatski",
  [ELanguages.FINNISH]: "Suomi",
  [ELanguages.DANISH]: "Dansk",
  [ELanguages.BULGARIAN]: "Български",
  [ELanguages.SLOVAK]: "Slovenčina",
};
