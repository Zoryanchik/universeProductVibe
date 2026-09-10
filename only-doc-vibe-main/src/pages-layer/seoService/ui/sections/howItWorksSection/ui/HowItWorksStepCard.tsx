import type { FC } from "react";

import { Image } from "@/shared/ui/image";
import { Title } from "@/shared/ui/title";

import type { IHowItWorksStepProps } from "../model/types";

interface HowItWorksStepCardProps extends IHowItWorksStepProps {
  stepNumber: number;
}

export const HowItWorksStepCard: FC<HowItWorksStepCardProps> = ({
  stepNumber,
  title,
  description,
  imageSrc,
  imageAlt,
}) => {
  const formattedNumber = String(stepNumber).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 md:gap-3 md:p-8">
      {imageSrc && (
        <div className="flex h-[140px] w-full items-center justify-center md:h-[180px]">
          <Image
            src={imageSrc}
            alt={imageAlt ?? title}
            className="h-full w-auto max-w-full object-contain"
          />
        </div>
      )}

      <div className="flex w-full items-center gap-2">
        <div className="h-px flex-1 bg-black/15" />
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black md:h-[34px] md:w-[34px]">
          <span className="text-[13px] leading-[1.23] font-extrabold text-white uppercase md:text-sm md:font-semibold md:normal-case">
            {formattedNumber}
          </span>
        </div>
        <div className="h-px flex-1 bg-black/15" />
      </div>

      <div className="flex flex-col items-center gap-1 md:gap-2">
        <Title level="h3" variant="desktop-title-5" className="text-center">
          {title}
        </Title>
        <p className="text-center text-sm leading-[1.29] text-black/60">
          {description}
        </p>
      </div>
    </div>
  );
};
