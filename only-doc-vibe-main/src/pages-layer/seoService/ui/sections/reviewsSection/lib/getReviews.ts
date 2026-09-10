import type { Review } from "../model/types";

type TranslateFunction = (key: string) => string;

const REVIEW_IDS = ["1", "2", "3", "4", "5", "6"] as const;

export const getReviews = (t: TranslateFunction): readonly Review[] =>
  REVIEW_IDS.map((id) => ({
    id,
    title: t(`reviewsSection.reviews.${id}.title`),
    text: t(`reviewsSection.reviews.${id}.text`),
    author: t(`reviewsSection.reviews.${id}.author`),
    date: t(`reviewsSection.reviews.${id}.date`),
  }));
