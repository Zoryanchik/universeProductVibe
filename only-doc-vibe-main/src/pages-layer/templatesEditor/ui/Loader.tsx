import { useEffect, useRef, useState, type FC } from "react";

import { cn } from "@/shared/lib/utils/cn";

const DEFAULT_DURATION = 2000;
const TICK = 50;

type LoaderSize = "small" | "large";

const SIZE_CONFIG = {
  small: { px: 24, strokeWidth: 10, radius: 45, container: "w-6 h-6" },
  large: {
    px: 100,
    strokeWidth: 7,
    radius: 46,
    container: "w-[100px] h-[100px]",
  },
} as const;

interface LoaderProps {
  ready: boolean;
  onComplete?: () => void;
  overlay?: boolean;
  duration?: number;
  size?: LoaderSize;
}

export const Loader: FC<LoaderProps> = ({
  ready,
  onComplete,
  overlay = false,
  duration = DEFAULT_DURATION,
  size = "large",
}) => {
  const [percentage, setPercentage] = useState(0);
  const readyRef = useRef(ready);
  readyRef.current = ready;

  const config = SIZE_CONFIG[size];
  const circumference = 2 * Math.PI * config.radius;

  useEffect(() => {
    const phase1Duration = Math.round((duration * 2) / 3);
    const phase2Duration = duration - phase1Duration;

    const start = Date.now();
    let phase: 1 | 2 | "done" = 1;
    let phase2Start = 0;

    const timer = setInterval(() => {
      const elapsed = Date.now() - start;

      if (phase === 1) {
        const t = Math.min(elapsed / phase1Duration, 1);
        const eased = 1 - (1 - t) * (1 - t);
        setPercentage(Math.round(eased * 90));

        if (elapsed >= phase1Duration && readyRef.current) {
          phase = 2;
          phase2Start = Date.now();
        }
      } else if (phase === 2) {
        const t = Math.min((Date.now() - phase2Start) / phase2Duration, 1);
        const eased = 1 - (1 - t) * (1 - t);
        setPercentage(Math.round(90 + eased * 10));

        if (t >= 1) {
          phase = "done";
          setPercentage(100);
          clearInterval(timer);
          onComplete?.();
        }
      }
    }, TICK);

    return () => clearInterval(timer);
  }, [onComplete, duration]);

  const offset = circumference - (percentage / 100) * circumference;
  const indeterminate = percentage === 0;

  const content = (
    <div
      className={cn(
        "relative flex items-center justify-center",
        config.container
      )}
    >
      <svg viewBox="0 0 100 100" className={cn("-rotate-90", config.container)}>
        <circle
          cx="50"
          cy="50"
          r={config.radius}
          strokeWidth={config.strokeWidth}
          className="fill-none stroke-[rgba(0,0,0,0.08)]"
        />
        <circle
          cx="50"
          cy="50"
          r={config.radius}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "ease fill-none stroke-[var(--color-primary,#5f30e2)] transition-[stroke-dashoffset] duration-[400ms]",
            indeterminate && "animate-pulse"
          )}
        />
      </svg>
      {size === "large" && (
        <span className="absolute text-center font-[Outfit,sans-serif] text-[18px] leading-[26px] font-medium text-[var(--color-text-primary,rgba(0,0,0,0.87))]">
          {percentage}%
        </span>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-action-disabled-bg,rgba(0,0,0,0.12))] backdrop-blur-[8px]">
        {content}
      </div>
    );
  }

  return content;
};
