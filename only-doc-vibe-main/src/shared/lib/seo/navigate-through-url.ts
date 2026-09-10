import { defaultLocale } from "../../config/locale";

/**
 * Strips the origin from absolute URLs so that CMS-provided full URLs
 * (e.g. https://only-doc.com/contact-us) are always treated as same-tab
 * internal links regardless of which WEB_HOST the env is configured with.
 */
const toRelativePath = (path: string): string => {
  if (!/^https?:\/\//i.test(path)) return path;

  try {
    const { pathname, search, hash } = new URL(path);

    return pathname + search + hash;
  } catch {
    return path;
  }
};

export function navigateThroughURL(path: string, lang: string) {
  const relativePath = toRelativePath(path);

  if (lang === defaultLocale) return relativePath;

  if (relativePath === "/" || relativePath === "") return `/${lang}`;

  return `/${lang}${relativePath}`;
}
