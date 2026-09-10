import React from "react";

import { useTranslation } from "@/shared/lib/translations";
import { trackEvent } from "@/shared/lib/analytics";
import { EAnalyticsEvents } from "@/shared/lib/analytics/events";

interface SuggestedQuestionsProps {
  questions: readonly string[];
  onPick: (question: string) => void;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  questions,
  onPick,
}) => {
  const { t } = useTranslation();
  if (questions.length === 0) return null;

  return (
    <div className="mt-3 flex flex-col gap-3 self-stretch rounded-2xl bg-[color:var(--color-primary-opacity-12)] p-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
        <SparklesIcon />
        {t("aiSummarizer.chat.suggestedQuestionsHeader")}
      </div>
      <div className="flex w-full flex-col gap-3">
        {questions.map((q, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              trackEvent(EAnalyticsEvents.SUMMARIZER_SUGGESTED_QUESTION_TAP, {
                index: i,
              });
              onPick(q);
            }}
            className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border-2 border-transparent bg-white px-3 py-2.5 text-start text-[15px] leading-[21px] text-gray-800 transition-colors hover:border-[color:var(--color-primary)]"
          >
            <span className="flex-1">{q}</span>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-transparent transition-colors group-hover:bg-[color:var(--color-primary-opacity-16)]">
              <ArrowRightIcon />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

const SparklesIcon: React.FC = () => (
  <svg
    width="21"
    height="21"
    viewBox="0 0 21 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    className="shrink-0 text-[color:var(--color-primary)]"
  >
    <path
      d="M17.05 3.59844L15.5 2.87344C15.4 2.82344 15.35 2.74844 15.35 2.64844C15.35 2.54844 15.4 2.47344 15.5 2.42344L17.05 1.69844L17.775 0.148436C17.825 0.0484366 17.9 -0.00156307 18 -0.00156307C18.1 -0.00156307 18.175 0.0484366 18.225 0.148436L18.95 1.69844L20.5 2.42344C20.6 2.47344 20.65 2.54844 20.65 2.64844C20.65 2.74844 20.6 2.82344 20.5 2.87344L18.95 3.59844L18.225 5.14844C18.175 5.24844 18.1 5.29844 18 5.29844C17.9 5.29844 17.825 5.24844 17.775 5.14844L17.05 3.59844ZM5.55 3.59844L4 2.87344C3.9 2.82344 3.85 2.74844 3.85 2.64844C3.85 2.54844 3.9 2.47344 4 2.42344L5.55 1.69844L6.275 0.148436C6.325 0.0484366 6.4 -0.00156307 6.5 -0.00156307C6.6 -0.00156307 6.675 0.0484366 6.725 0.148436L7.45 1.69844L9 2.42344C9.1 2.47344 9.15 2.54844 9.15 2.64844C9.15 2.74844 9.1 2.82344 9 2.87344L7.45 3.59844L6.725 5.14844C6.675 5.24844 6.6 5.29844 6.5 5.29844C6.4 5.29844 6.325 5.24844 6.275 5.14844L5.55 3.59844ZM17.05 15.0984L15.5 14.3734C15.4 14.3234 15.35 14.2484 15.35 14.1484C15.35 14.0484 15.4 13.9734 15.5 13.9234L17.05 13.1984L17.775 11.6484C17.825 11.5484 17.9 11.4984 18 11.4984C18.1 11.4984 18.175 11.5484 18.225 11.6484L18.95 13.1984L20.5 13.9234C20.6 13.9734 20.65 14.0484 20.65 14.1484C20.65 14.2484 20.6 14.3234 20.5 14.3734L18.95 15.0984L18.225 16.6484C18.175 16.7484 18.1 16.7984 18 16.7984C17.9 16.7984 17.825 16.7484 17.775 16.6484L17.05 15.0984ZM3.1 20.3484L0.3 17.5484C0.1 17.3484 5.96046e-08 17.1068 5.96046e-08 16.8234C5.96046e-08 16.5401 0.1 16.2984 0.3 16.0984L11.45 4.94844C11.65 4.74844 11.8917 4.64844 12.175 4.64844C12.4583 4.64844 12.7 4.74844 12.9 4.94844L15.7 7.74844C15.9 7.94844 16 8.1901 16 8.47344C16 8.75677 15.9 8.99844 15.7 9.19844L4.55 20.3484C4.35 20.5484 4.10833 20.6484 3.825 20.6484C3.54167 20.6484 3.3 20.5484 3.1 20.3484ZM3.85 18.2484L11 11.0484L9.6 9.64844L2.4 16.7984L3.85 18.2484Z"
      fill="currentColor"
    />
  </svg>
);

const ArrowRightIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4 shrink-0 text-gray-500 transition-colors group-hover:text-[color:var(--color-primary)]"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
