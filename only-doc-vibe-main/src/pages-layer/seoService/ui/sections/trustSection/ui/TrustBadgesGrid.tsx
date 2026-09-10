import type { FC } from "react";

import { Image } from "@/shared/ui/image";

import type { ITrustBadge } from "../model/types";

interface ITrustBadgesGridProps {
  readonly badges: readonly ITrustBadge[];
}

export const TrustBadgesGrid: FC<ITrustBadgesGridProps> = ({ badges }) => {
  return (
    <div className="flex w-full max-w-[600px] flex-wrap items-center justify-center gap-8 md:max-w-[1000px] md:gap-12 lg:max-w-[1200px]">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className="flex h-[80px] w-[calc(33.333%-1.5rem)] items-center justify-center sm:h-[100px] md:h-[160px] md:w-auto md:flex-1"
        >
          <Image
            src={badge.iconPath}
            alt={badge.alt}
            width={100}
            height={100}
            className="h-full w-auto object-contain"
          />
        </div>
      ))}
    </div>
  );
};
