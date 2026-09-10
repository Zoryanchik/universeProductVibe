import type { StoreType } from "polotno/model/store";
import { injectGoogleFont } from "polotno/utils/fonts";

const isGoogleFontsCssUrl = (url: string) =>
  url.includes("fonts.googleapis.com/css");

/**
 * Polotno skips Google Font injection for fonts listed in store.fonts without
 * a url/styles (injectCustomFont silently no-ops), and when a url IS present
 * it creates a @font-face with that url as `src`. If the url is a Google Fonts
 * CSS stylesheet (not a binary font file), the @font-face silently fails.
 *
 * Both cases cause fonts to render as Arial during loading and then fall back
 * to the browser default after the load timeout ("font reset").
 *
 * Call this after every store.loadJSON to ensure the Google Fonts CSS is
 * actually injected for those entries.
 */
export function ensureGoogleFonts(store: StoreType) {
  (
    store.fonts as unknown as {
      fontFamily: string;
      url?: string;
      styles?: unknown;
    }[]
  ).forEach((font) => {
    const needsInjection =
      (!font.url && !font.styles) ||
      (font.url && isGoogleFontsCssUrl(font.url));
    if (needsInjection) {
      injectGoogleFont(font.fontFamily);
    }
  });
}
