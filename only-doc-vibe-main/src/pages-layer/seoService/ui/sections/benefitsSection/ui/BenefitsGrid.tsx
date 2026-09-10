import type { FC } from "react";

import { BenefitCard } from "./BenefitCard";

interface BenefitItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly iconUrl?: string;
}

interface BenefitsGridProps {
  readonly benefits: readonly BenefitItem[];
  readonly gridLabel: string;
}

export const BenefitsGrid: FC<BenefitsGridProps> = ({
  benefits,
  gridLabel,
}) => {
  return (
    <div
      className="grid w-full grid-cols-2 gap-2 md:grid-cols-3 md:gap-4"
      role="list"
      aria-label={gridLabel}
    >
      {benefits.map((benefit) => (
        <BenefitCard
          key={benefit.id}
          title={benefit.title}
          description={benefit.description}
          iconUrl={benefit.iconUrl}
        />
      ))}
    </div>
  );
};
