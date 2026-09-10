import { useEffect, useRef, useState, type FC, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/shared/lib/utils/cn";

import { SearchInput } from "./SearchInput";
import { Checkbox } from "./Checkbox";

export interface DropdownMenuOption {
  label: string;
  value: string;
  iconName?: string;
  disabled?: boolean;
  depth?: number;
  variant?: "danger";
  expandable?: boolean;
  expanded?: boolean;
}

export const DIVIDER_VALUE = "__divider__";
const ITEM_HEIGHT = 42;

interface DropdownMenuProps {
  options: DropdownMenuOption[];
  isOpen: boolean;
  onSelect: (value: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  placement?: "top" | "bottom";
  maxItems?: number;
  minWidth?: number;
  searchable?: boolean;
  size?: "medium" | "large";
  multiSelect?: boolean;
  selectedValues?: string[];
  footerContent?: ReactNode;
  onToggleExpand?: (value: string) => void;
}

export const DropdownMenu: FC<DropdownMenuProps> = ({
  options,
  isOpen,
  onSelect,
  onClose,
  anchorRef,
  placement = "top",
  maxItems,
  minWidth,
  searchable,
  size = "medium",
  multiSelect,
  selectedValues,
  footerContent,
  onToggleExpand,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !anchorRef.current || !menuRef.current) return;

    const menu = menuRef.current;
    if (minWidth) {
      menu.style.minWidth = `${minWidth}px`;
    }

    const anchor = anchorRef.current.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    const MARGIN = 8;
    const rawLeft = anchor.left + anchor.width / 2 - menuRect.width / 2;
    const left = Math.max(
      MARGIN,
      Math.min(rawLeft, window.innerWidth - menuRect.width - MARGIN)
    );

    // Auto-flip so the menu stays on-screen (e.g. anchored to a bottom toolbar).
    const fitsBelow =
      anchor.bottom + 8 + menuRect.height <= window.innerHeight - MARGIN;
    const fitsAbove = anchor.top - 8 - menuRect.height >= MARGIN;
    const openTop =
      placement === "top" ? fitsAbove || !fitsBelow : !fitsBelow && fitsAbove;

    menu.style.left = `${left}px`;
    menu.style.top = openTop
      ? `${Math.max(MARGIN, anchor.top - menuRect.height - 8)}px`
      : `${anchor.bottom + 8}px`;
  }, [isOpen, anchorRef, placement, search, minWidth]);

  if (!isOpen) return null;

  const filteredOptions =
    searchable && search
      ? options.filter(
          (o) =>
            o.value === DIVIDER_VALUE ||
            o.label.toLowerCase().includes(search.toLowerCase())
        )
      : options;

  const scrollMaxHeight = maxItems ? maxItems * ITEM_HEIGHT : undefined;

  return createPortal(
    <>
      <div onClick={onClose} className="fixed inset-0 z-[999]" />
      <div
        ref={menuRef}
        className="fixed z-[1000] flex flex-col gap-0.5 rounded-2xl bg-[var(--color-common-white)] p-2 shadow-[0px_6px_12px_-2px_var(--color-action-8),0px_8px_40px_0px_var(--color-action-8)]"
      >
        {searchable && (
          <div className="pb-1">
            <SearchInput
              value={search}
              onChange={(value) => setSearch(value)}
              autoFocus
            />
          </div>
        )}
        <div
          className={cn(
            "flex flex-col gap-0.5 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-[rgba(0,0,0,0.6)] [&::-webkit-scrollbar-track]:bg-transparent",
            scrollMaxHeight ? "overflow-y-auto" : undefined
          )}
          style={scrollMaxHeight ? { maxHeight: scrollMaxHeight } : undefined}
        >
          {filteredOptions.map((option, index) => {
            if (option.value === DIVIDER_VALUE) {
              const hasBefore = filteredOptions
                .slice(0, index)
                .some((o) => o.value !== DIVIDER_VALUE);
              const hasAfter = filteredOptions
                .slice(index + 1)
                .some((o) => o.value !== DIVIDER_VALUE);
              if (!hasBefore || !hasAfter) return null;

              return (
                <div
                  key={`divider-${index}`}
                  className="flex items-center px-3 py-1 after:h-px after:flex-1 after:bg-[rgba(0,0,0,0.14)] after:content-['']"
                />
              );
            }

            return (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => {
                  if (option.disabled) return;

                  if (option.expandable && onToggleExpand) {
                    onToggleExpand(option.value);
                  } else {
                    onSelect(option.value);
                    if (!multiSelect) onClose();
                  }
                }}
                style={{ paddingLeft: 12 + (option.depth ?? 0) * 16 }}
                className={cn(
                  "group flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl border-none bg-[var(--color-common-white)] pe-3 font-[Outfit,sans-serif] text-[16px] leading-[22px] font-normal text-ellipsis whitespace-nowrap text-[var(--color-text-primary)] transition-[background-color] duration-100",
                  size === "large" ? "min-h-14 py-3" : "min-h-10 py-2",
                  "hover:bg-[var(--color-action-hover)]",
                  "active:bg-[var(--color-primary-opacity-8,rgba(31,93,226,0.08))] active:text-[var(--color-primary)]",
                  "focus:outline-none",
                  "disabled:cursor-default disabled:opacity-40 disabled:hover:bg-[var(--color-common-white)]",
                  option.variant === "danger" &&
                    "text-[var(--color-error-dark,#aa2e25)]"
                )}
              >
                {multiSelect && (
                  <span
                    className={cn(
                      "flex",
                      option.expandable
                        ? "pointer-events-auto"
                        : "pointer-events-none"
                    )}
                  >
                    <Checkbox
                      compact
                      checked={selectedValues?.includes(option.value)}
                      onChange={
                        option.expandable
                          ? () => onSelect(option.value)
                          : undefined
                      }
                    />
                  </span>
                )}
                {option.iconName && (
                  <span
                    className={cn(
                      "material-symbols-rounded shrink-0 text-[20px] [font-variation-settings:'FILL'_0,'wght'_400,'GRAD'_0,'opsz'_20]",
                      "text-[rgba(0,0,0,0.48)] group-active:text-[var(--color-primary)]",
                      option.variant === "danger" &&
                        "text-[var(--color-error-dark,#aa2e25)]"
                    )}
                  >
                    {option.iconName}
                  </span>
                )}
                {option.label}
                {option.expandable && (
                  <span className="material-symbols-rounded ms-auto shrink-0 text-2xl leading-none text-[rgba(0,0,0,0.48)] [font-variation-settings:'FILL'_0,'wght'_400,'GRAD'_0,'opsz'_24]">
                    {option.expanded ? "expand_less" : "expand_more"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {footerContent && (
          <div className="mt-1 flex items-center justify-end border-t border-[rgba(0,0,0,0.08)] px-3 pt-2 pb-1">
            {footerContent}
          </div>
        )}
      </div>
    </>,
    document.body
  );
};
