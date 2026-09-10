import { defaultLocale } from "../../config/locale";
import { getLangFromUrl } from "./get-lang-from-url";

export const getLangPath = (path: string, slug: string | undefined) => {
  const langPath =
    getLangFromUrl(path) === defaultLocale ? "" : `/${getLangFromUrl(path)}`;

  return `${langPath}${slug}`;
};
