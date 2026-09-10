import { availableLocales, defaultLocale } from "../../config/locale";
import type { ELanguages } from "../../constants/languages";

export const getLangFromUrl = (path: string) => {
  const splittedURL = path.split("/").filter((element) => element !== "");
  const firstPathItem = splittedURL[0];

  const currentLocaleList = availableLocales;

  if (!splittedURL.length) {
    return defaultLocale;
  }

  if (firstPathItem.length > 3) {
    return defaultLocale;
  }

  if (
    (firstPathItem.length === 2 || firstPathItem === "fil") &&
    currentLocaleList.includes(firstPathItem as ELanguages)
  ) {
    return firstPathItem;
  }

  return defaultLocale;
};
