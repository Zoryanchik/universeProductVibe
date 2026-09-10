import { defaultLocale } from "../../config/locale";
import type { ELanguages } from "../../constants/languages";
import { logger } from "../utils/logger";
import type { TFunction } from "./types";

export function createT(
  translation: Record<string, unknown>,
  language: ELanguages,
  fallbackTranslation?: Record<string, unknown>
): TFunction {
  return ((
    key: string,
    values?: Record<string, string | number>
  ): string | Record<string, unknown> => {
    const splittedKey = key.split(".");

    const result = splittedKey.reduce(
      (acc: unknown, keyPart: string, index: number) => {
        if (typeof acc === "string" || acc === null || acc === undefined) {
          return acc;
        }

        if (typeof acc === "object" && acc !== null) {
          const accRecord = acc as Record<string, unknown>;

          if (!accRecord[keyPart] && splittedKey[index + 1]) {
            const mergedKey = `${keyPart}.${splittedKey[index + 1]}`;

            if (mergedKey in accRecord) {
              return accRecord[mergedKey];
            }
          }

          return accRecord[keyPart];
        }

        return acc;
      },
      translation as Record<string, unknown>
    );

    // If result is undefined or null, try fallback
    if (result === undefined || result === null) {
      if (language === defaultLocale) {
        logger.error(
          `Translation key ${key} not found, language: ${language}. Returning key as is.`
        );

        return key;
      }

      logger.error(
        `Translation key ${key} not found, language: ${language}. Falling back to default language.`
      );

      if (!fallbackTranslation) {
        return key;
      }

      return createT(fallbackTranslation, defaultLocale)(key, values);
    }

    // If result is an object, return it as-is (for nested objects like hero.title)
    if (typeof result === "object" && result !== null) {
      return result as Record<string, unknown>;
    }

    // If result is a string, apply interpolation if values are provided
    if (typeof result === "string") {
      if (typeof values === "object" && values !== null) {
        return result.replaceAll(/{{(\w+)}}/g, (match, p1: string) => {
          const val = values[p1];

          return val !== undefined && val !== null ? String(val) : match;
        });
      }

      return result;
    }

    // Fallback: convert to string
    return String(result);
  }) as TFunction;
}
