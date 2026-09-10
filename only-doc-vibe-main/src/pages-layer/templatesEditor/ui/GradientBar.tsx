import { useCallback, useRef, type FC, type MouseEvent } from "react";

import { cn } from "@/shared/lib/utils/cn";

const STOP_SIZE = 32;

export interface GradientStop {
  offset: number;
  color: string;
}

interface GradientBarProps {
  stops: GradientStop[];
  activeStopIndex: number;
  onStopSelect: (index: number) => void;
  onStopsChange: (stops: GradientStop[]) => void;
}

function buildCssGradient(stops: GradientStop[]): string {
  const sorted = [...stops].sort((a, b) => a.offset - b.offset);
  const parts = sorted
    .map((s) => `${s.color} ${Math.round(s.offset * 100)}%`)
    .join(", ");

  return `linear-gradient(to right, ${parts})`;
}

function findNearestStopColor(stops: GradientStop[], offset: number): string {
  const sorted = [...stops].sort((a, b) => a.offset - b.offset);
  const left = sorted.reduce<GradientStop | null>(
    (prev, s) => (s.offset <= offset ? s : prev),
    null
  );

  return left?.color ?? sorted[0]?.color ?? "#FFFFFF";
}

export const GradientBar: FC<GradientBarProps> = ({
  stops,
  activeStopIndex,
  onStopSelect,
  onStopsChange,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const getOffsetFromX = useCallback((clientX: number): number => {
    const track = trackRef.current;
    if (!track) return 0;

    const rect = track.getBoundingClientRect();

    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  const handleTrackClick = useCallback(
    (e: MouseEvent) => {
      if ((e.target as HTMLElement).dataset.stopHandle) return;

      const offset = getOffsetFromX(e.clientX);
      const newColor = findNearestStopColor(stops, offset);
      const newStops = [...stops, { offset, color: newColor }];
      onStopsChange(newStops);
      onStopSelect(newStops.length - 1);
    },
    [stops, getOffsetFromX, onStopsChange, onStopSelect]
  );

  const handleStopMouseDown = useCallback(
    (e: MouseEvent, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      onStopSelect(index);

      const onMove = (ev: globalThis.MouseEvent) => {
        const offset = getOffsetFromX(ev.clientX);
        const updated = stops.map((s, i) =>
          i === index ? { ...s, offset } : s
        );
        onStopsChange(updated);
      };

      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [stops, getOffsetFromX, onStopSelect, onStopsChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === "Backspace" || e.key === "Delete") && stops.length > 2) {
        const newStops = stops.filter((_, i) => i !== activeStopIndex);
        onStopsChange(newStops);
        onStopSelect(Math.min(activeStopIndex, newStops.length - 1));
      }
    },
    [stops, activeStopIndex, onStopsChange, onStopSelect]
  );

  const gradient = buildCssGradient(stops);

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative h-8 w-full touch-none outline-none select-none"
    >
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className="absolute start-4 end-4 top-1/2 h-[2px] -translate-y-1/2 cursor-pointer"
        style={{ background: gradient }}
      />
      {stops.map((stop, i) => (
        <div
          key={i}
          data-stop-handle="true"
          onMouseDown={(e) => handleStopMouseDown(e, i)}
          style={{
            left: `calc(${STOP_SIZE / 2 - stop.offset * STOP_SIZE}px + ${stop.offset * 100}%)`,
            backgroundColor: stop.color,
          }}
          className={cn(
            "absolute top-0 h-8 w-8 -translate-x-1/2 cursor-grab border transition-shadow duration-150 active:cursor-grabbing",
            i === activeStopIndex
              ? "z-[2] rounded-lg border-[var(--color-primary)] shadow-[0_0_0_3px_var(--color-primary-opacity-24)]"
              : "z-[1] rounded border-[var(--color-action-stroke)]"
          )}
        />
      ))}
    </div>
  );
};
