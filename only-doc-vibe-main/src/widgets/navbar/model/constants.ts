import ArabicFlagIcon from "@public/assets/flags/arabic.svg?url";
import EnglishFlagIcon from "@public/assets/flags/english.svg?url";
import FrenchFlagIcon from "@public/assets/flags/french.svg?url";
import GermanFlagIcon from "@public/assets/flags/german.svg?url";
import IndonesianFlagIcon from "@public/assets/flags/indonesian.svg?url";
import PolishFlagIcon from "@public/assets/flags/polish.svg?url";
import PortugueseFlagIcon from "@public/assets/flags/portuguese.svg?url";
import SpanishFlagIcon from "@public/assets/flags/spanish.svg?url";

import { ELanguages } from "@/shared/constants/languages";
import type { EServiceTabId } from "@/shared/constants/service-tabs";
import { TOOL_CARDS, type IToolCard } from "@/shared/constants/service-tabs";

export const FEATURES_GROUP_BY_CATEGORY: Partial<
  Record<EServiceTabId, IToolCard[]>
> = TOOL_CARDS.reduce<Partial<Record<EServiceTabId, IToolCard[]>>>(
  (acc, tool) => {
    (acc[tool.category] ??= []).push(tool);

    return acc;
  },
  {}
);

// TODO: change icons when new languages arrived
export const LANGUAGES_FLAGS_MAP: Record<ELanguages, { flag: string }> = {
  [ELanguages.ENGLISH]: { flag: EnglishFlagIcon },
  [ELanguages.FRENCH]: { flag: FrenchFlagIcon },
  [ELanguages.SPANISH]: { flag: SpanishFlagIcon },
  [ELanguages.ITALIAN]: { flag: EnglishFlagIcon },
  [ELanguages.GERMAN]: { flag: GermanFlagIcon },
  [ELanguages.GREEK]: { flag: EnglishFlagIcon },
  [ELanguages.JAPANESE]: { flag: EnglishFlagIcon },
  [ELanguages.PORTUGUESE]: { flag: PortugueseFlagIcon },
  [ELanguages.TURKISH]: { flag: EnglishFlagIcon },
  [ELanguages.POLISH]: { flag: PolishFlagIcon },
  [ELanguages.KOREAN]: { flag: EnglishFlagIcon },
  [ELanguages.VIETNAMESE]: { flag: EnglishFlagIcon },
  [ELanguages.FILIPINO]: { flag: EnglishFlagIcon },
  [ELanguages.DUTCH]: { flag: EnglishFlagIcon },
  [ELanguages.ROMANIAN]: { flag: EnglishFlagIcon },
  [ELanguages.INDONESIAN]: { flag: IndonesianFlagIcon },
  [ELanguages.HEBREW]: { flag: EnglishFlagIcon },
  [ELanguages.ARABIC]: { flag: ArabicFlagIcon },
  [ELanguages.HINDI]: { flag: EnglishFlagIcon },
  [ELanguages.CZECH]: { flag: EnglishFlagIcon },
  [ELanguages.MALAY]: { flag: EnglishFlagIcon },
  [ELanguages.THAI]: { flag: EnglishFlagIcon },
  [ELanguages.SWEDISH]: { flag: EnglishFlagIcon },
  [ELanguages.NORWEGIAN]: { flag: EnglishFlagIcon },
  [ELanguages.HUNGARIAN]: { flag: EnglishFlagIcon },
  [ELanguages.CROATIAN]: { flag: EnglishFlagIcon },
  [ELanguages.FINNISH]: { flag: EnglishFlagIcon },
  [ELanguages.DANISH]: { flag: EnglishFlagIcon },
  [ELanguages.BULGARIAN]: { flag: EnglishFlagIcon },
  [ELanguages.SLOVAK]: { flag: EnglishFlagIcon },
};
