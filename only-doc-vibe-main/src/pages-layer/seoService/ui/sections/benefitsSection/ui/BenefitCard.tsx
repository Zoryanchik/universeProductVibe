import type { FC } from "react";

import { cn } from "@/shared/lib/utils/cn";
import { Image } from "@/shared/ui/image";
import { Title } from "@/shared/ui/title";

interface BenefitCardProps {
  readonly title: string;
  readonly description: string;
  readonly iconUrl?: string;
  readonly className?: string;
}

export const BenefitCard: FC<BenefitCardProps> = ({
  title,
  description,
  iconUrl,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl bg-[var(--color-bg-light-grey)] p-4 md:gap-6 md:p-6 lg:p-8",
        className
      )}
      role="listitem"
    >
      <Title level="h3" variant="desktop-title-5" className="text-black/87">
        {title}
      </Title>

      {iconUrl && (
        <div className="flex h-[54px] w-[54px] items-center justify-center lg:h-[100px] lg:w-[100px]">
          <Image
            src={iconUrl}
            alt={title}
            className="h-[54px] w-[54px] object-contain lg:h-[100px] lg:w-[100px]"
          />
        </div>
      )}

      <p className="text-caption lg:text-body text-center text-black/87">
        {description}
      </p>
    </div>
  );
};
