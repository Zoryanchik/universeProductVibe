import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type FC,
  type PropsWithChildren,
} from "react";

import { getCurrentLanguage } from "../translations/getCurrentLanguage";
import {
  getLocalizedToolHref,
  type LocaleSlugMap,
} from "../seo/get-localized-tool-href";

interface LocalizedLinksValue {
  lang: string;
  slugMap: LocaleSlugMap;
}

const LocalizedLinksContext = createContext<LocalizedLinksValue | null>(null);

interface ProviderProps extends PropsWithChildren {
  slugMap?: LocaleSlugMap;
  lang?: string;
}

export const LocalizedLinksProvider: FC<ProviderProps> = ({
  slugMap = {},
  lang,
  children,
}) => {
  const value = useMemo<LocalizedLinksValue>(
    () => ({ slugMap, lang: lang ?? getCurrentLanguage() }),
    [slugMap, lang]
  );

  return (
    <LocalizedLinksContext.Provider value={value}>
      {children}
    </LocalizedLinksContext.Provider>
  );
};

export const useLocalizedHref = (): ((path: string) => string) => {
  const ctx = useContext(LocalizedLinksContext);

  return useCallback(
    (path: string): string => {
      const lang = ctx?.lang ?? getCurrentLanguage();

      return getLocalizedToolHref(path, lang, ctx?.slugMap);
    },
    [ctx]
  );
};
