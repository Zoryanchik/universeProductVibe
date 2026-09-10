import { useCallback, useRef, type FC, type PointerEvent } from "react";

interface SliderProps {
  label?: string;
  value: number;
  min: number;
  max: number;
  hideValue?: boolean;
  suffix?: string;
  onChange: (value: number) => void;
}

export const Slider: FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  hideValue = false,
  suffix,
  onChange,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const clampAndEmit = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const ratio = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width)
      );
      onChange(Math.round(min + ratio * (max - min)));
    },
    [min, max, onChange]
  );

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      e.preventDefault();
      clampAndEmit(e.clientX);

      const onMove = (ev: globalThis.PointerEvent) => clampAndEmit(ev.clientX);
      const onUp = () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        document.removeEventListener("pointercancel", onUp);
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
      document.addEventListener("pointercancel", onUp);
    },
    [clampAndEmit]
  );

  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <span className="font-[Outfit,sans-serif] text-[18px] leading-5 font-medium text-[var(--color-text-primary)]">
          {label}
        </span>
      )}
      <div className="flex w-full items-center gap-1">
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          className="relative h-5 flex-1 cursor-pointer touch-none select-none"
        >
          <div className="absolute start-0 end-0 top-[6px] h-2 rounded-3xl bg-[var(--color-material-grey-300,#e0e0e0)]" />
          <div
            className="absolute start-0 top-[6px] h-2 rounded-3xl bg-[var(--color-primary)]"
            style={{ width: `${percent}%` }}
          />
          <div
            className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_6px_20px_rgba(0,0,0,0.16),0_2px_4px_rgba(0,0,0,0.04)]"
            style={{ left: `${percent}%` }}
          />
        </div>
        {!hideValue && (
          <span className="w-10 shrink-0 text-end font-[Outfit,sans-serif] text-[16px] leading-[22px] font-normal text-[var(--color-text-primary)]">
            {value}
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};
