import React from "react";

import { Title } from "@/shared/ui/title";

interface BenefitsTitleProps {
  readonly title: string;
  readonly className?: string;
}

export const BenefitsTitle: React.FC<BenefitsTitleProps> = ({ title }) => {
  return (
    <Title variant="desktop-title-2" align="left">
      {title}
    </Title>
  );
};
