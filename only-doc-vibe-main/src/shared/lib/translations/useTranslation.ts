import { useCallback, useLayoutEffect, useState } from "react";

import { createT } from "./createT";
import { getCachedLocale, getLocale } from "./getClientT";
import { getCurrentLanguage } from "./getCurrentLanguage";
import type { TFunction } from "./types";
import type { TranslationSchema } from "./server-t";

export const useTranslation = (): { t: TFunction<TranslationSchema> } => {
  const currentLanguage = getCurrentLanguage();
  const cachedLocale = getCachedLocale(currentLanguage);
  const [translations, setTranslations] = useState<Record<
    string,
    unknown
  > | null>(cachedLocale);

  useLayoutEffect(() => {
    getLocale(currentLanguage).then(setTranslations);
  }, [currentLanguage]);

  const t: TFunction<TranslationSchema> = useCallback(
    (
      key: string,
      options?: Record<string, string | number>
    ): string | Record<string, unknown> => {
      if (!translations) return "";

      return createT(translations, currentLanguage)(key, options);
    },
    [translations, currentLanguage]
  ) as TFunction<TranslationSchema>;

  return { t };
};
