import React, { useRef, useState, useEffect, useCallback } from "react";

import { cn } from "@/shared/lib/utils/cn";

import type { Review } from "../model/types";
import { ReviewCard } from "./ReviewCard";
import { useReviewsSlider } from "../lib/useReviewsSlider";

interface ReviewsSliderProps {
  readonly reviews: readonly Review[];
}

const CARD_GAP = 16;
const SWIPE_THRESHOLD = 50;

const ArrowButton: React.FC<{
  readonly direction: "left" | "right";
  readonly onClick: () => void;
}> = ({ direction, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={direction === "left" ? "Previous reviews" : "Next reviews"}
    className="hidden cursor-pointer p-2 text-black/48 transition-colors hover:text-black/70 min-[600px]:block"
  >
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      className="rtl:rotate-180"
    >
      {direction === "left" ? (
        <path
          d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
          fill="currentColor"
        />
      ) : (
        <path
          d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"
          fill="currentColor"
        />
      )}
    </svg>
  </button>
);

const PaginationDot: React.FC<{
  readonly isActive: boolean;
  readonly index: number;
  readonly onClick: () => void;
}> = ({ isActive, index, onClick }) => (
  <button
    type="button"
    role="tab"
    aria-selected={isActive}
    aria-label={`Go to slide ${index + 1}`}
    onClick={onClick}
    // ≥24px hit area for touch targets; the visual indicator stays small inside.
    className="group flex h-6 min-w-6 items-center justify-center"
  >
    <span
      aria-hidden="true"
      className={cn(
        "h-2 rounded-full transition-all duration-200",
        isActive
          ? "w-6 bg-[var(--color-action-main)]"
          : "w-2 bg-[var(--color-action-main)]/20 group-hover:bg-[var(--color-action-main)]/40"
      )}
    />
  </button>
);

export const ReviewsSlider: React.FC<ReviewsSliderProps> = ({ reviews }) => {
  const {
    activeSlide,
    totalSlides,
    reviewsPerView,
    goToSlide,
    goToPrev,
    goToNext,
  } = useReviewsSlider({ reviews });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const touchStartRef = useRef(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const firstChild = container.firstElementChild as HTMLElement | null;
    if (!firstChild) return;

    const cardWidth = firstChild.offsetWidth;
    // Under dir="rtl" scrollLeft counts down from 0, so compare magnitudes.
    const index = Math.round(
      Math.abs(container.scrollLeft) / (cardWidth + CARD_GAP)
    );
    setMobileActiveIndex(Math.min(Math.max(0, index), reviews.length - 1));
  }, [reviews.length]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToCard = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;

    const children = Array.from(container.children) as HTMLElement[];
    const target = children[index];
    if (!target) return;

    // offsetLeft is always measured from the left edge, which does not match the
    // scroll origin under dir="rtl". Scrolling by the measured delta instead
    // works the same in both directions.
    container.scrollBy({
      left:
        target.getBoundingClientRect().left -
        container.getBoundingClientRect().left,
      behavior: "smooth",
    });
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const diff = touchStartRef.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > SWIPE_THRESHOLD) {
        const isRtl = getComputedStyle(e.currentTarget).direction === "rtl";
        const swipedTowardEnd = isRtl ? diff < 0 : diff > 0;
        if (swipedTowardEnd) goToNext();
        else goToPrev();
      }
    },
    [goToNext, goToPrev]
  );

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        ref={scrollRef}
        className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto min-[600px]:hidden [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {reviews.map((review, index) => (
          <div
            key={review.id}
            className="w-[calc(100vw-80px)] shrink-0 snap-start"
          >
            <ReviewCard review={review} index={index} />
          </div>
        ))}
      </div>

      {!isMounted ? (
        <div
          className="hidden w-full grid-cols-2 gap-4 min-[600px]:grid min-[1024px]:grid-cols-3"
          role="region"
          aria-label="Customer reviews"
        >
          {reviews.map((review, index) => (
            <div key={review.id}>
              <ReviewCard review={review} index={index} />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="hidden w-full items-center gap-4 min-[600px]:flex"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <ArrowButton direction="left" onClick={goToPrev} />

          <div
            className="grid flex-1 grid-cols-2 gap-4 min-[1024px]:grid-cols-3"
            role="region"
            aria-label="Customer reviews carousel"
          >
            {reviews.map((review, index) => {
              const page = Math.floor(index / reviewsPerView);
              const col = (index % reviewsPerView) + 1;
              const isActive = page === activeSlide;

              return (
                <div
                  key={review.id}
                  className={!isActive ? "invisible" : ""}
                  style={{ gridRow: 1, gridColumn: col }}
                >
                  <ReviewCard review={review} index={index} />
                </div>
              );
            })}
          </div>

          <ArrowButton direction="right" onClick={goToNext} />
        </div>
      )}

      <div
        className="flex items-center justify-center gap-1.5 pt-2 min-[600px]:hidden"
        role="tablist"
        aria-label="Slide navigation"
      >
        {reviews.map((_, index) => (
          <PaginationDot
            key={index}
            isActive={mobileActiveIndex === index}
            index={index}
            onClick={() => scrollToCard(index)}
          />
        ))}
      </div>

      {isMounted && (
        <div
          className="hidden items-center justify-center gap-1.5 pt-2 min-[600px]:flex"
          role="tablist"
          aria-label="Slide navigation"
        >
          {Array.from({ length: totalSlides }).map((_, index) => (
            <PaginationDot
              key={index}
              isActive={activeSlide === index}
              index={index}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
