"use client";

import type { FC } from "react";

import { Title } from "@/shared/ui/title";
import { UnderlinedText } from "@/shared/ui/underlined-text";

import { HeroServiceSection } from "../../homeHeroSection/ui/HeroServiceSection";
import type { IAllToolsSectionProps } from "../model/types";

export const AllToolsSection: FC<IAllToolsSectionProps> = ({
  title,
  tabs,
  cards,
  featureHighlights = [],
  showMoreButtonText,
}) => {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-10 px-4 pt-16 pb-10 md:px-[150px] md:pt-[104px] md:pb-10">
        <Title variant="desktop-title-2" level="h2" className="text-center">
          {typeof title === "string" ? (
            title
          ) : (
            <UnderlinedText
              prefix={title?.prefix}
              highlight={String(title?.highlight)}
              suffix={title?.suffix}
            />
          )}
        </Title>

        <div className="w-full max-w-[1140px]">
          <HeroServiceSection
            tabs={tabs}
            cards={cards}
            featureHighlights={featureHighlights}
            showMoreButtonText={showMoreButtonText}
          />
        </div>
      </div>
    </section>
  );
};
