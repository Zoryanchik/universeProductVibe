import { ELanguages } from "../../constants/languages";

const CACHED_TRNASLATIONS: Record<ELanguages, Record<string, unknown> | null> =
  Object.fromEntries(
    Object.values(ELanguages).map((lang) => [lang, null])
  ) as Record<ELanguages, Record<string, unknown> | null>;

export const getLocale = async (
  lang: ELanguages
): Promise<Record<string, unknown>> => {
  if (CACHED_TRNASLATIONS[lang]) {
    return CACHED_TRNASLATIONS[lang];
  }

  const importLang = () => {
    switch (lang) {
      case ELanguages.ENGLISH:
        return import(`@public/locales/en/translation.json`);

      case ELanguages.PORTUGUESE:
        return import(`@public/locales/pt/translation.json`);

      case ELanguages.SPANISH:
        return import(`@public/locales/es/translation.json`);

      case ELanguages.INDONESIAN:
        return import(`@public/locales/id/translation.json`);

      case ELanguages.ARABIC:
        return import(`@public/locales/ar/translation.json`);

      case ELanguages.FRENCH:
        return import(`@public/locales/fr/translation.json`);

      case ELanguages.GERMAN:
        return import(`@public/locales/de/translation.json`);

      case ELanguages.POLISH:
        return import(`@public/locales/pl/translation.json`);

      default:
        return import(`@public/locales/en/translation.json`);
    }
  };

  const result = await importLang().then(
    (res) => res.default as Record<string, unknown>
  );

  CACHED_TRNASLATIONS[lang] = result;

  return result;
};

export const getCachedLocale = (lang: ELanguages) => {
  return CACHED_TRNASLATIONS[lang];
};
