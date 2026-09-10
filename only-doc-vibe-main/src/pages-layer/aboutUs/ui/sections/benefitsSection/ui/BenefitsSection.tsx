import type { FC } from "react";

import type { IBenefitsSectionProps } from "../model/types";

export const BenefitsSection: FC<IBenefitsSectionProps> = ({ title, text }) => {
  return (
    <section className="px-6 max-md:px-3">
      <div className="text-text-primary mx-auto flex w-full max-w-[1440px] flex-col items-center gap-12 self-stretch rounded-[60px] bg-white px-4 py-16 max-md:gap-6 max-md:rounded-[40px] max-md:py-8">
        <h2 className="text-desktop-title-2 max-md:text-mobile-title-2 text-center">
          {title}
        </h2>
        <p className="text-body mx-auto max-w-[1140px] self-stretch">{text}</p>
      </div>
    </section>
  );
};
