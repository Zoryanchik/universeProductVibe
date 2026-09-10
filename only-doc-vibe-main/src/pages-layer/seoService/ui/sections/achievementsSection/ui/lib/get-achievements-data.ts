import type { TFunction } from "@/shared/lib/translations/types";
import type { TranslationSchema } from "@/shared/lib/translations/server-t";

import type { IAchievementCard } from "../../model/types";
import { ACHIEVEMENT_CARDS } from "../../model/constants";

export interface AchievementsData {
  readonly title: string;
  readonly cards: readonly IAchievementCard[];
}

export interface AchievementsCmsData {
  readonly title?: string;
  readonly cards?: readonly IAchievementCard[];
}

/**
 * Headless logic for AchievementsSection
 * Prepares data for rendering by combining CMS data (future) and translations
 *
 * This function is designed to handle both:
 * 1. Current state: Uses hardcoded constants with translations
 * 2. Future state: Will accept optional CMS data that overrides constants
 *
 * @param t - Translation function
 * @param cmsData - Optional CMS data (for future Strapi integration)
 * @returns Prepared data with translated title and cards
 */
export const getAchievementsData = (
  t: TFunction<TranslationSchema>,
  cmsData?: AchievementsCmsData
): AchievementsData => {
  // Title: Use CMS data if available, otherwise translate from i18n
  const title = cmsData?.title ?? t("achievements.title");

  // Cards: Use CMS data if available, otherwise use constants with translations
  const sourceCards = cmsData?.cards ?? ACHIEVEMENT_CARDS;

  const cards = sourceCards.map((card) => ({
    ...card,
    // If label comes from CMS, use it directly; otherwise translate it
    label: cmsData?.cards ? card.label : t(`achievements.${card.id}`),
  }));

  return {
    title,
    cards,
  };
};
