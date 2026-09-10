import React from "react";

import { cn } from "../../../lib/utils/cn";
import { Title } from "../../title";
import type { FaqItemProps } from "../model/types";

export const FaqItem: React.FC<FaqItemProps> = ({
  idx,
  question,
  answer,
  groupName,
  defaultOpen,
  onOpen,
  variant = "default",
}) => {
  const answerId = `faq-answer-${question.replace(/\s+/g, "-").toLowerCase()}`;
  const isAboutUs = variant === "about-us";

  // Native <details>/<summary>: toggling and the full answer text work with
  // JavaScript disabled, and every answer is always present in the HTML (not
  // rendered on demand). React only enhances it with analytics when hydrated.
  // The list-item role lives on the wrapper (not the <details>) so we don't
  // override the disclosure's native semantics in the accessibility tree.
  return (
    <div role="listitem" className="w-full">
      <details
        name={groupName}
        open={defaultOpen}
        data-variant={variant}
        className={cn(
          "faq-item flex w-full flex-col bg-white transition-shadow",
          isAboutUs
            ? "rounded-[12px] border-2 border-transparent min-[1024px]:rounded-2xl"
            : "rounded-2xl border-2 border-transparent"
        )}
        data-testid={`faq-item-${idx}`}
        onToggle={(event) => {
          if ((event.currentTarget as HTMLDetailsElement).open) {
            onOpen();
          }
        }}
      >
        <summary
          aria-controls={answerId}
          className={cn(
            "flex w-full cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden",
            isAboutUs
              ? "px-4 py-2 min-[1024px]:px-8 min-[1024px]:py-6"
              : "px-8 py-6"
          )}
        >
          <Title
            level="h3"
            variant={isAboutUs ? "desktop-title-5" : "desktop-title-4"}
            align="left"
            className={cn(
              "flex-1 text-black/87",
              isAboutUs
                ? "text-mobile-title-5 min-[1024px]:text-desktop-title-4"
                : ""
            )}
          >
            <>{question}</>
          </Title>

          <span
            aria-hidden="true"
            className={cn(
              "faq-chevron flex shrink-0 items-center justify-center bg-black/8 text-black/48 transition-transform duration-300",
              isAboutUs
                ? "rounded-lg p-1.5 min-[1024px]:rounded-xl min-[1024px]:p-3"
                : "rounded-xl p-3"
            )}
          >
            <svg
              className={cn(
                isAboutUs ? "size-5 min-[1024px]:size-6" : "size-6"
              )}
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
                fill="currentColor"
              />
            </svg>
          </span>
        </summary>

        <p
          id={answerId}
          className={cn(
            "text-black/60",
            isAboutUs
              ? "text-body-2 min-[1024px]:text-body px-4 pe-9 pb-3 min-[1024px]:px-8 min-[1024px]:pe-12 min-[1024px]:pb-6"
              : "text-body px-8 pe-20 pb-6"
          )}
        >
          {answer}
        </p>
      </details>
    </div>
  );
};
