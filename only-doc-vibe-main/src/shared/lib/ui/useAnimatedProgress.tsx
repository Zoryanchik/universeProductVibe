import { useEffect, useState } from "react";

interface IUseAnimatedProgressParams {
  durationInSeconds: number;
  progressBarMap?: Record<number, number>;
  stopped?: boolean;
  min?: number;
  max?: number;
  onFinished?: () => void;
}

export const useAnimatedProgress = ({
  durationInSeconds,
  progressBarMap,
  min = 0,
  max = 90,
  stopped = false,
  onFinished,
}: IUseAnimatedProgressParams): { progress: number; barProgress: number } => {
  const durationInMilliseconds = durationInSeconds * 1000;
  const [progress, setProgress] = useState<number>(0);
  const isFinished = progress >= 1;

  useEffect(() => {
    if (isFinished) {
      onFinished?.();
    }
    // eslint-disable-next-line
  }, [isFinished]);

  useEffect(() => {
    if (stopped || isFinished) return;

    let requestId: number;

    const animate = (startTime: number, timestamp: number) => {
      const timeFrame = timestamp - startTime;
      const progressedForThisFrame = timeFrame / durationInMilliseconds;
      setProgress((previousProgress) =>
        Math.min(1, previousProgress + progressedForThisFrame)
      );

      if (progress < max) {
        const newStartTime = Date.now();
        requestId = requestAnimationFrame(() =>
          animate(newStartTime, Date.now())
        );
      }
    };

    const startTime = Date.now();
    requestId = requestAnimationFrame(() => animate(startTime, Date.now()));

    return () => {
      cancelAnimationFrame(requestId);
    };
  }, [stopped, isFinished]); // eslint-disable-line

  const calculatedProgress = calculateProgress(progress, min, max);

  const barProgress = (() => {
    if (!progressBarMap) {
      return Number(calculatedProgress.toFixed(0));
    }

    const progressValue = Number(calculatedProgress.toFixed(0));

    const entries = Object.entries(progressBarMap);

    const currentEntry = entries.find(([key]) => progressValue <= Number(key));

    return currentEntry?.[1] || 100;
  })();

  return { progress: calculatedProgress, barProgress };
};

export const calculateProgress = (
  time: number,
  min: number,
  max: number
): number => (max - min) * time + min;
