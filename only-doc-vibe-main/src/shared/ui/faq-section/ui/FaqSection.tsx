import React from "react";

import { cn } from "../../../lib/utils/cn";
import { Title } from "../../title";
import type { FaqItem as FaqItemType, FaqSectionProps } from "../model/types";
import { FaqItem } from "./FaqItem";
import {
  EAnalyticsEvents,
  getCurrentPageCategory,
  trackEvent,
} from "../../../lib/analytics";

// Open-state visuals are declared here (instead of on the items) so they ship in
// the server-rendered HTML and work with JavaScript disabled.
const FAQ_OPEN_STYLES = `
.faq-item[open] .faq-chevron{transform:rotate(180deg)}
.faq-item[data-variant="default"][open]{border-color:var(--color-action-main)}
.faq-item[data-variant="default"][open] .faq-chevron{background-color:#000;color:#fff}
.faq-item[data-variant="about-us"][open]{border-color:#000}
.faq-item{interpolate-size:allow-keywords}
.faq-item::details-content{height:0;overflow:hidden;transition:height .3s ease,content-visibility .3s allow-discrete}
.faq-item[open]::details-content{height:auto}
@media (max-width:1023px){.faq-item[data-variant="about-us"][open] > summary{padding-top:.75rem;padding-bottom:.75rem}}
@media (min-width:1024px){.faq-item[data-variant="about-us"][open] .faq-chevron{background-color:#000;color:#fff}}
`;

export const FaqSection: React.FC<FaqSectionProps> = ({
  title,
  items,
  className,
  defaultOpenId,
  variant = "default",
}) => {
  // A unique name turns the <details> set into a JS-free exclusive accordion and
  // keeps multiple FAQ sections on the same page from sharing a group.
  const groupName = `faq-${React.useId().replace(/:/g, "")}`;

  return (
    <section
      className={cn("w-full bg-[var(--color-bg-light-grey)]", className)}
      aria-labelledby="faq-section-title"
    >
      <style>{FAQ_OPEN_STYLES}</style>

      <div
        className={cn(
          "mx-auto flex w-full max-w-[1440px] flex-col items-center",
          variant === "about-us"
            ? "gap-4 px-4 py-6 min-[1024px]:gap-10 min-[1024px]:px-[114px] min-[1024px]:pt-10 min-[1024px]:pb-[104px] min-[1440px]:px-[150px]"
            : "gap-10 px-4 pt-10 pb-[104px] md:px-[150px]"
        )}
      >
        <Title
          id="faq-section-title"
          variant="desktop-title-2"
          className={cn(
            "relative text-black/87",
            variant === "about-us"
              ? "text-mobile-title-2 min-[1024px]:text-desktop-title-2"
              : ""
          )}
        >
          {title}
        </Title>

        <div
          className={cn(
            "flex w-full flex-col",
            variant === "about-us" ? "gap-2 min-[1024px]:gap-4" : "gap-4"
          )}
          role="list"
          aria-label="Frequently asked questions"
          data-testid="faq-list"
        >
          {items.map((item: FaqItemType, index: number) => (
            <FaqItem
              key={item.id}
              idx={index}
              question={item.question}
              answer={item.answer}
              groupName={groupName}
              defaultOpen={item.id === defaultOpenId}
              onOpen={() => {
                trackEvent(EAnalyticsEvents.FAQ_OPEN_TAP, {
                  category: getCurrentPageCategory(),
                  number: index + 1,
                });
              }}
              variant={variant}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
