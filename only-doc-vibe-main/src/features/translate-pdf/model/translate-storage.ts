import { LOCAL_STORAGE_KEYS } from "@/shared/constants/local-storage-keys";
import { appStorage } from "@/shared/lib/storage/app-storage";

export const TranslateStorage = {
  getDetectedLanguage: () => {
    return appStorage.getItem(LOCAL_STORAGE_KEYS.DETECTED_LANG_FOR_TRANSLATE);
  },
  setDetectedLanguage: (language: string) => {
    appStorage.setItem(
      LOCAL_STORAGE_KEYS.DETECTED_LANG_FOR_TRANSLATE,
      language
    );
  },
  clearDetectedLanguage: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.DETECTED_LANG_FOR_TRANSLATE);
  },

  getSourceLanguage: () => {
    return appStorage.getItem(LOCAL_STORAGE_KEYS.TRANSLATE_FROM_LANGUAGE_CODE);
  },
  setSourceLanguage: (language: string) => {
    appStorage.setItem(
      LOCAL_STORAGE_KEYS.TRANSLATE_FROM_LANGUAGE_CODE,
      language
    );
  },
  clearSourceLanguage: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.TRANSLATE_FROM_LANGUAGE_CODE);
  },

  getTargetLanguage: () => {
    return appStorage.getItem(LOCAL_STORAGE_KEYS.TRANSLATE_TO_LANGUAGE_CODE);
  },
  setTargetLanguage: (language: string) => {
    appStorage.setItem(LOCAL_STORAGE_KEYS.TRANSLATE_TO_LANGUAGE_CODE, language);
  },
  clearTargetLanguage: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.TRANSLATE_TO_LANGUAGE_CODE);
  },
};
