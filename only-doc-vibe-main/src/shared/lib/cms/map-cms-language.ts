import { ELanguages, isELanguage } from "../../constants/languages";

export const mapFromCMSLanguage = (language: string): ELanguages => {
  if (language === "nn") {
    return ELanguages.NORWEGIAN;
  }

  if (!isELanguage(language)) {
    throw new Error(`Invalid locale ${language}`);
  }

  return language as ELanguages;
};

export const mapToCMSLanguage = (language: ELanguages): string => {
  if (language === ELanguages.NORWEGIAN) {
    return "nn";
  }

  return language;
};
