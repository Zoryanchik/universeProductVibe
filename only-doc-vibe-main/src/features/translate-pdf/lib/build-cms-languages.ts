import type { components } from "@/shared/api/cms/cms-schema";
import {
  type ELanguages,
  LANGUAGES_LABELS,
} from "@/shared/constants/languages";

import {
  TRANSLATE_LANGUAGES,
  type ITranslateLanguage,
} from "../model/constants/translate-languages";

type CmsLanguageItem = components["schemas"]["CommonImageItemComponent"];

/** Reverse lookup: native label (e.g. "Deutsch") -> ELanguages code ("de") */
const LABEL_TO_LANGUAGE = new Map<string, ELanguages>(
  (Object.entries(LANGUAGES_LABELS) as [ELanguages, string][]).map(
    ([code, label]) => [label.toLowerCase(), code]
  )
);

/**
 * Builds the language list from CMS `available_languages`.
 * Each CMS item's `image_id` is the native language label (e.g. "English", "Deutsch").
 * Flag images come from the CMS `image.url` when available.
 * Falls back to the full hardcoded list when CMS data is absent.
 */
export const buildCmsLanguages = (
  cmsLanguages: CmsLanguageItem[] | undefined
): ITranslateLanguage[] => {
  if (!cmsLanguages?.length) return TRANSLATE_LANGUAGES;

  const result: ITranslateLanguage[] = [];

  for (const item of cmsLanguages) {
    const code = LABEL_TO_LANGUAGE.get(item.image_id.toLowerCase());

    if (!code) continue;

    const base = TRANSLATE_LANGUAGES.find((l) => l.code === code);

    result.push({
      code,
      label: item.image_id,
      flagCode: base?.flagCode ?? "",
      francCode: base?.francCode ?? "",
      flagImageUrl: item.image?.url,
    });
  }

  return result;
};
