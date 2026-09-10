import React from "react";

import type { ReviewCardProps } from "../model/types";

const RATING = 5;

const StarRating: React.FC<{ readonly rating: number }> = ({ rating }) => (
  <div
    className="flex items-center gap-0.5 text-[#F5A623]"
    role="img"
    aria-label={`Rated ${rating} out of 5`}
  >
    {Array.from({ length: 5 }).map((_, index) => (
      <svg
        key={index}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={index < rating ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
        className="h-[18px] w-[18px] md:h-5 md:w-5"
      >
        <path
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          strokeLinejoin="round"
        />
      </svg>
    ))}
  </div>
);

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div
      className="flex h-full w-full shrink-0 flex-col gap-4 rounded-2xl bg-white p-4 shadow-[0_4px_8px_rgba(0,0,0,0.04)] md:gap-5 md:p-8"
      aria-label={`Review by ${review.author}`}
    >
      <div className="flex flex-col gap-2 md:gap-3">
        <StarRating rating={RATING} />
        <span className="text-mobile-title-6 font-semibold text-black/87 md:text-xl md:leading-[1.2]">
          {review.title}
        </span>
      </div>

      <p className="text-body-2 text-black/87">{review.text}</p>

      <div className="text-body-2 mt-auto flex flex-wrap items-center gap-3 text-black/60">
        <time dateTime={review.date}>
          {new Date(review.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </time>
        <span aria-hidden="true">•</span>
        <span>{review.author}</span>
      </div>
    </div>
  );
};
