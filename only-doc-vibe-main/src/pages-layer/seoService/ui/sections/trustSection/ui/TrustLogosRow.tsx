import type { FC } from "react";

import { Image } from "@/shared/ui/image";

import type { ITrustBadge } from "../model/types";

interface ITrustLogosRowProps {
  readonly badges: readonly ITrustBadge[];
  readonly variant?: "default" | "about-us";
}

export const TrustLogosRow: FC<ITrustLogosRowProps> = ({
  badges,
  variant = "default",
}) => {
  const isAboutUs = variant === "about-us";

  return (
    <div
      className={
        isAboutUs
          ? "flex w-full items-center justify-between gap-2 min-[600px]:gap-4 min-[1024px]:gap-6"
          : "flex w-full items-center justify-between gap-6 md:gap-24"
      }
    >
      {badges.map((badge) => (
        <div
          key={badge.id}
          className={
            isAboutUs
              ? "flex h-[52px] flex-1 items-center justify-center min-[600px]:h-[64px] min-[1024px]:h-[96px]"
              : "flex h-[100px] flex-1 items-center justify-center md:h-[136px]"
          }
        >
          <Image
            src={badge.iconPath}
            alt={badge.alt}
            className={
              isAboutUs
                ? "max-h-[22px] w-auto max-w-full object-contain min-[600px]:max-h-[28px] min-[1024px]:max-h-[52px]"
                : "max-h-[60px] w-auto max-w-full object-contain md:max-h-[76px]"
            }
          />
        </div>
      ))}
    </div>
  );
};
