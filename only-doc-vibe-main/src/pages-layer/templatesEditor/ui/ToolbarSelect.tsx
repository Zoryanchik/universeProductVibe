import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type FC,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";

import { DropdownMenu, type DropdownMenuOption } from "./DropdownMenu";

const FOCUS_SHADOW =
  "focus-within:shadow-[0_0_0_4px_var(--color-primary-opacity-12),inset_0_1px_4px_0_var(--color-primary-opacity-24),inset_0_-1px_4px_0_var(--color-primary-opacity-24)]";

interface ToolbarSelectProps {
  value: string;
  options: DropdownMenuOption[];
  onSelect: (value: string) => void;
  width?: number;
  height?: number;
  maxItems?: number;
  minWidth?: number;
  searchable?: boolean;
  editable?: boolean;
  inputFilter?: (value: string) => boolean;
  placement?: "top" | "bottom";
}

export const ToolbarSelect: FC<ToolbarSelectProps> = ({
  value,
  options,
  onSelect,
  width = 180,
  height = 40,
  maxItems,
  minWidth,
  searchable,
  editable,
  inputFilter,
  placement = "bottom",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption?.label ?? value;

  const [inputValue, setInputValue] = useState(displayLabel);

  useEffect(() => {
    setInputValue(displayLabel);
  }, [displayLabel]);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      if (inputFilter && !inputFilter(next)) return;

      setInputValue(next);
    },
    [inputFilter]
  );

  const handleInputSubmit = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed && trimmed !== displayLabel) {
      onSelect(trimmed);
    } else {
      setInputValue(displayLabel);
    }
  }, [inputValue, displayLabel, onSelect]);

  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleInputSubmit();
        inputRef.current?.blur();
      }

      if (e.key === "Escape") {
        setInputValue(displayLabel);
        inputRef.current?.blur();
      }
    },
    [handleInputSubmit, displayLabel]
  );

  const handleInputClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleInputFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.select();
    },
    []
  );

  return (
    <div className="relative" style={{ width, height }}>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-full w-full cursor-pointer items-center justify-between gap-2 overflow-hidden rounded-[10px] border border-[var(--color-action-stroke)] bg-transparent px-[10px] py-2 outline-none focus-within:border-[var(--color-primary-opacity-50)] hover:border-[rgba(0,0,0,0.3)] ${FOCUS_SHADOW}`}
      >
        {editable ? (
          <input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputSubmit}
            onKeyDown={handleInputKeyDown}
            onClick={handleInputClick}
            onFocus={handleInputFocus}
            className="w-full min-w-0 border-none bg-transparent p-0 font-[Outfit,sans-serif] text-[16px] leading-[22px] font-normal text-[var(--color-text-primary)] outline-none"
          />
        ) : (
          <span className="overflow-hidden font-[Outfit,sans-serif] text-[16px] leading-[22px] font-normal text-ellipsis whitespace-nowrap text-[var(--color-text-primary)]">
            {displayLabel}
          </span>
        )}
        <span className="material-symbols-rounded shrink-0 text-[20px] text-[var(--color-text-secondary)] opacity-80 [font-variation-settings:'FILL'_0,'wght'_400,'GRAD'_0,'opsz'_20]">
          {isOpen ? "arrow_drop_up" : "arrow_drop_down"}
        </span>
      </button>
      <DropdownMenu
        options={options}
        isOpen={isOpen}
        onSelect={onSelect}
        onClose={() => setIsOpen(false)}
        anchorRef={anchorRef}
        placement={placement}
        maxItems={maxItems}
        minWidth={minWidth}
        searchable={searchable}
      />
    </div>
  );
};
