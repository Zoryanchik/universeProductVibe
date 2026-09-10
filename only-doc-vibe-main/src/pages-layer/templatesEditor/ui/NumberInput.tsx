import { useState, useEffect, type FC, type KeyboardEventHandler } from "react";

import { cn } from "@/shared/lib/utils/cn";

const DEFAULT_VALUE = 10;

const FOCUS_SHADOW =
  "focus-within:shadow-[0_0_0_4px_var(--color-primary-opacity-12),inset_0_1px_4px_0_var(--color-primary-opacity-24),inset_0_-1px_4px_0_var(--color-primary-opacity-24)]";

interface NumberInputProps {
  value: number;
  suffix: string;
  onChange: (value: number) => void;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  min?: number;
  step?: number;
  size?: "medium" | "large";
}

export const NumberInput: FC<NumberInputProps> = ({
  value,
  suffix,
  onChange,
  onKeyDown,
  min,
  step,
  size = "medium",
}) => {
  const [displayValue, setDisplayValue] = useState(String(value));

  useEffect(() => {
    setDisplayValue(String(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplayValue(raw);

    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    const parsed = parseFloat(displayValue);
    if (isNaN(parsed) || displayValue.trim() === "") {
      setDisplayValue(String(DEFAULT_VALUE));
      onChange(DEFAULT_VALUE);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-hidden rounded-[10px] border border-[rgba(0,0,0,0.14)] px-[10px] py-2 transition-[border-color] duration-150 focus-within:border-[var(--color-primary-opacity-50)]",
        FOCUS_SHADOW,
        size === "medium" ? "h-10" : "h-11"
      )}
    >
      <input
        type="number"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        min={min}
        step={step}
        className="min-w-0 flex-1 border-none bg-transparent font-[Outfit,sans-serif] text-[16px] leading-6 font-light text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]"
      />
      <span className="shrink-0 font-[Outfit,sans-serif] text-[16px] leading-6 font-light text-[var(--color-text-secondary)]">
        {suffix}
      </span>
    </div>
  );
};
