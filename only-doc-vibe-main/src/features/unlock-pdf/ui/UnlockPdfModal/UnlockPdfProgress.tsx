import type { FC } from "react";

import { useTranslation } from "@/shared/lib/translations";
import { useAnimatedProgress } from "@/shared/lib/ui/useAnimatedProgress";

interface UnlockPdfProgressProps {
  durationSeconds?: number;
  onFinished?: () => void;
}

export const UnlockPdfProgress: FC<UnlockPdfProgressProps> = ({
  durationSeconds = 45,
  onFinished,
}) => {
  const { t } = useTranslation();
  const { barProgress } = useAnimatedProgress({
    durationInSeconds: durationSeconds,
    min: 12,
    max: 88,
    onFinished,
  });

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <div className="relative h-1 flex-1 overflow-hidden rounded bg-[#d2ebe6]">
          <div
            className="h-full rounded bg-[#149886] transition-[width] duration-300"
            style={{ width: `${barProgress}%` }}
          />
        </div>
        <span className="min-w-7 text-end text-[10px] leading-[10px] font-semibold text-black/87">
          {barProgress}%
        </span>
      </div>
      <span className="text-caption text-text-disabled">
        {String(t("modals.unlock_pdf.estimated_time"))}
      </span>
    </div>
  );
};
