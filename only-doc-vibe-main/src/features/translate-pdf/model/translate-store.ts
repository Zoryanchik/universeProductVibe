import { create } from "zustand";

import { createSelectors } from "@/shared/lib/state/createSelectors";

import { TranslateStorage } from "./translate-storage";

interface ITranslateStore {
  detectedLanguage: string | null;
  sourceLanguage: string | null;
  targetLanguage: string | null;
}

const getInitialState = (): ITranslateStore => {
  return {
    detectedLanguage: TranslateStorage.getDetectedLanguage(),
    sourceLanguage: TranslateStorage.getSourceLanguage(),
    targetLanguage: TranslateStorage.getTargetLanguage(),
  };
};

const translateStore = create<ITranslateStore>(getInitialState);

export const setDetectedLanguage = (language: string) => {
  TranslateStorage.setDetectedLanguage(language);
  translateStore.setState({ detectedLanguage: language });
};

export const setSourceLanguage = (language: string) => {
  TranslateStorage.setSourceLanguage(language);
  translateStore.setState({ sourceLanguage: language });
};

export const setTargetLanguage = (language: string) => {
  TranslateStorage.setTargetLanguage(language);
  translateStore.setState({ targetLanguage: language });
};

export const useTranslateStore = createSelectors(translateStore);
