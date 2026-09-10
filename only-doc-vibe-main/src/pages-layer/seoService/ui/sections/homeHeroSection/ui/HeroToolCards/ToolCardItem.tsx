"use client";

import type { FC } from "react";

import {
  EAnalyticsEvents,
  normalizeFeatureName,
  trackEvent,
} from "@/shared/lib/analytics";
import { Image } from "@/shared/ui/image";

import type { IToolCardItemProps } from "./types";

export const ToolCardItem: FC<IToolCardItemProps> = ({ card }) => {
  return (
    <a
      href={card.url}
      onClick={() =>
        trackEvent(EAnalyticsEvents.LANDING_FEATURES_TAP, {
          feature_name: normalizeFeatureName(card.title),
        })
      }
      className="group relative flex h-full w-full flex-col items-start gap-2.5 rounded-2xl bg-[var(--color-common-white)] p-4 no-underline opacity-100 shadow-[0px_0px_8px_3px_rgba(0,0,0,0.08)] outline outline-2 outline-transparent transition-[outline-color] duration-200 hover:opacity-100 hover:outline-[var(--color-action-main)] md:gap-4 md:p-6"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center md:h-[60px] md:w-[60px]">
        {card.icon && (
          <Image
            src={card.icon}
            alt={card.title}
            className="h-10 w-10 md:h-[60px] md:w-[60px]"
          />
        )}
      </div>

      <div className="flex flex-col gap-0.5 md:gap-1">
        <span className="text-subtitle lg:text-desktop-title-6-emph text-black/87 [--text-subtitle--font-weight:600]">
          {card.title}
        </span>
        {card.description && (
          <p className="text-caption md:text-body-2 text-black/60">
            {card.description}
          </p>
        )}
      </div>

      {card.ctaButton && (
        <span className="text-body-2 absolute end-6 top-[29px] hidden items-center gap-1 rounded-lg bg-[var(--color-primary)] px-2 py-1.5 font-medium text-[var(--color-primary-contrast-text)] group-hover:flex">
          {card.ctaButton}
          <svg
            width="16"
            height="16"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <path
              d="M9.707 3.293a1 1 0 0 0-1.414 1.414L11.586 8H4a1 1 0 0 0 0 2h7.586l-3.293 3.293a1 1 0 1 0 1.414 1.414l5-5a1 1 0 0 0 0-1.414l-5-5Z"
              fill="currentColor"
            />
          </svg>
        </span>
      )}
    </a>
  );
};
