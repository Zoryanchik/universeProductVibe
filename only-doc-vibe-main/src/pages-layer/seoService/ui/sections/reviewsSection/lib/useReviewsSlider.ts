import { useState, useCallback, useEffect, useMemo } from "react";

import type { Review } from "../model/types";

const SM_BREAKPOINT = 600;
const MD_BREAKPOINT = 1024;

const getReviewsPerView = (width: number): number => {
  if (width >= MD_BREAKPOINT) return 3;

  if (width >= SM_BREAKPOINT) return 2;

  return 1;
};

interface UseReviewsSliderProps {
  readonly reviews: readonly Review[];
}

interface UseReviewsSliderReturn {
  readonly activeSlide: number;
  readonly totalSlides: number;
  readonly reviewsPerView: number;
  readonly visibleReviews: readonly Review[];
  readonly goToSlide: (index: number) => void;
  readonly goToPrev: () => void;
  readonly goToNext: () => void;
}

export const useReviewsSlider = ({
  reviews,
}: UseReviewsSliderProps): UseReviewsSliderReturn => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [reviewsPerView, setReviewsPerView] = useState(1);

  useEffect(() => {
    const updateReviewsPerView = (): void => {
      setReviewsPerView(getReviewsPerView(window.innerWidth));
    };
    updateReviewsPerView();
    window.addEventListener("resize", updateReviewsPerView);

    return () => window.removeEventListener("resize", updateReviewsPerView);
  }, []);

  const totalSlides = Math.ceil(reviews.length / reviewsPerView);

  const goToSlide = useCallback(
    (index: number): void => {
      if (index >= 0 && index < totalSlides) {
        setActiveSlide(index);
      }
    },
    [totalSlides]
  );

  const goToPrev = useCallback((): void => {
    setActiveSlide((prev) => (prev <= 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  const goToNext = useCallback((): void => {
    setActiveSlide((prev) => (prev >= totalSlides - 1 ? 0 : prev + 1));
  }, [totalSlides]);

  useEffect(() => {
    if (activeSlide >= totalSlides) {
      setActiveSlide(Math.max(0, totalSlides - 1));
    }
  }, [activeSlide, totalSlides]);

  const visibleReviews = useMemo(() => {
    const startIndex = activeSlide * reviewsPerView;

    return reviews.slice(startIndex, startIndex + reviewsPerView);
  }, [reviews, activeSlide, reviewsPerView]);

  return {
    activeSlide,
    totalSlides,
    reviewsPerView,
    visibleReviews,
    goToSlide,
    goToPrev,
    goToNext,
  };
};
