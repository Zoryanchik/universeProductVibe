import { useEffect, useRef, type FC } from "react";

import { cn } from "@/shared/lib/utils/cn";

const FOCUS_SHADOW =
  "focus-within:shadow-[0_0_0_4px_var(--color-primary-opacity-12),inset_0_1px_4px_0_var(--color-primary-opacity-24),inset_0_-1px_4px_0_var(--color-primary-opacity-24)]";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  size?: "medium" | "large";
}

export const SearchInput: FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder,
  autoFocus,
  size = "medium",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <div
      className={cn(
        "box-border flex w-full items-center gap-1 rounded-[10px] border border-[rgba(0,0,0,0.14)] py-2 ps-[10px] pe-2 focus-within:border-[var(--color-primary-opacity-50)]",
        FOCUS_SHADOW,
        size === "medium" ? "h-11 max-h-11 min-h-11" : "h-14 max-h-14 min-h-14"
      )}
    >
      <span className="material-symbols-rounded shrink-0 text-[20px] text-[rgba(0,0,0,0.6)] opacity-80 [font-variation-settings:'FILL'_0,'wght'_400,'GRAD'_0,'opsz'_20]">
        search
      </span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(value) => onChange(value.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-none bg-transparent font-[Outfit,sans-serif] text-[16px] leading-[22px] font-normal text-[rgba(0,0,0,0.87)] outline-none placeholder:text-[rgba(0,0,0,0.6)]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="flex shrink-0 cursor-pointer items-center justify-center rounded-lg p-[3px] outline-none"
        >
          <span className="material-symbols-rounded text-[20px] text-[var(--color-primary)] opacity-100 [font-variation-settings:'FILL'_1,'wght'_400,'GRAD'_0,'opsz'_20]">
            cancel
          </span>
        </button>
      )}
    </div>
  );
};
