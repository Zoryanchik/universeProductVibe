import type { FC } from "react";

import { Title } from "@/shared/ui/title";

import type { IHowItWorksSectionProps } from "../model/types";
import { HowItWorksStepCard } from "./HowItWorksStepCard";

export const HowItWorksSection: FC<IHowItWorksSectionProps> = ({
  title,
  steps,
}) => {
  return (
    <section className="w-full bg-[var(--color-bg-light-grey)]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-4 px-4 pt-6 pb-10 md:gap-6 md:px-[114px] md:pt-10 md:pb-[104px] lg:px-[150px]">
        <Title variant="desktop-title-2" level="h2" className="text-center">
          {title}
        </Title>

        <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-3 md:gap-4">
          {steps.map((step, index) => (
            <HowItWorksStepCard
              key={index}
              stepNumber={index + 1}
              title={step.title}
              description={step.description}
              imageSrc={step.imageSrc}
              imageAlt={step.imageAlt}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
