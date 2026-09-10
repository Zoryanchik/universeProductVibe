import { availableLocales, defaultLocale } from "@/shared/config/locale";

const BUILD_LOCALE = process.env.BUILD_LOCALE;

export interface ChatStaticPath {
  params: {
    lang: string | undefined;
  };
  props: {
    locale: string;
  };
}

/**
 * Enumerates static paths for the pdf-summarizer chat page in every locale.
 *
 * only-doc uses a single non-localized slug (`pdf-summarizer`) regardless of
 * language, so the only thing that varies between locales is the URL prefix
 * (the default locale gets no prefix; everything else lives under /{lang}).
 *   en -> /pdf-summarizer/chat
 *   es -> /es/pdf-summarizer/chat
 *   pt -> /pt/pdf-summarizer/chat
 */
export async function getChatStaticPaths(): Promise<ChatStaticPath[]> {
  return availableLocales
    .filter((locale) => (BUILD_LOCALE ? locale === BUILD_LOCALE : true))
    .map((locale) => ({
      params: {
        lang: locale === defaultLocale ? undefined : locale,
      },
      props: {
        locale,
      },
    }));
}
