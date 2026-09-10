import { useState, useRef, useCallback, type FC, type ReactNode } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { cn } from "@/shared/lib/utils/cn";
import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../../../../../ui/IconButton";
import { Tooltip } from "../../../../../ui/Tooltip";
import { ToolbarPopover } from "../../../../../ui/ToolbarPopover";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

type HeadStyle = "" | "arrow" | "circle" | "square";

const HEAD_OPTIONS: HeadStyle[] = ["", "arrow", "circle", "square"];

const START_HEAD_ICONS: Record<HeadStyle, ReactNode> = {
  "": (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
      <line
        x1="4"
        y1="12"
        x2="20"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
      <line
        x1="6"
        y1="12"
        x2="20"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
      />
      <polyline
        points="11,7 6,12 11,17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  ),
  circle: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
      <line
        x1="10"
        y1="12"
        x2="20"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="7" cy="12" r="3.5" fill="currentColor" />
    </svg>
  ),
  square: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
      <line
        x1="11"
        y1="12"
        x2="20"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
      />
      <polygon points="7,7.5 11.5,12 7,16.5 2.5,12" fill="currentColor" />
    </svg>
  ),
};

const END_HEAD_ICONS: Record<HeadStyle, ReactNode> = {
  "": (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
      <line
        x1="4"
        y1="12"
        x2="20"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
      <line
        x1="4"
        y1="12"
        x2="18"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
      />
      <polyline
        points="13,7 18,12 13,17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  ),
  circle: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
      <line
        x1="4"
        y1="12"
        x2="14"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="17" cy="12" r="3.5" fill="currentColor" />
    </svg>
  ),
  square: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
      <line
        x1="4"
        y1="12"
        x2="13"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
      />
      <polygon points="17,7.5 21.5,12 17,16.5 12.5,12" fill="currentColor" />
    </svg>
  ),
};

const optionButtonClass = (active: boolean): string =>
  cn(
    "flex h-10 w-10 cursor-pointer items-center justify-center rounded-[8px] border border-[var(--color-action-stroke)] bg-[var(--color-bg-white-bg)] p-2 text-[#323232] outline-none hover:border-[var(--color-primary-opacity-50)] hover:bg-[var(--color-primary-opacity-12)] hover:text-[var(--color-primary)]",
    active &&
      "border-[var(--color-primary-opacity-50)] bg-[var(--color-primary-opacity-12)] text-[var(--color-primary)] shadow-[0_0_0_4px_var(--color-primary-opacity-12),inset_0_1px_4px_0_var(--color-primary-opacity-24),inset_0_-1px_4px_0_var(--color-primary-opacity-24)]"
  );

interface LineHeadInstrumentProps {
  store: StoreType;
  property: "startHead" | "endHead";
  iconName: string;
  tooltipContent: string;
}

export const LineHeadInstrument: FC<LineHeadInstrumentProps> = observer(
  ({ store, property, iconName, tooltipContent }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const anchorRef = useRef<HTMLSpanElement>(null);
    const elements = store.selectedElements as unknown as AnyElement[];

    const firstEl = elements[0];
    const currentHead: HeadStyle = firstEl ? (firstEl[property] ?? "") : "";
    const icons = property === "startHead" ? START_HEAD_ICONS : END_HEAD_ICONS;

    const handleToggle = useCallback(() => setIsOpen((prev) => !prev), []);
    const handleClose = useCallback(() => setIsOpen(false), []);

    const handleHeadChange = useCallback(
      (style: HeadStyle) => {
        elements.forEach((el: AnyElement) => el.set({ [property]: style }));
      },
      [elements, property]
    );

    return (
      <>
        <span ref={anchorRef} className="inline-flex">
          <Tooltip content={tooltipContent}>
            <IconButton
              iconName={iconName}
              onClick={handleToggle}
              active={isOpen}
            />
          </Tooltip>
        </span>
        <ToolbarPopover
          isOpen={isOpen}
          onClose={handleClose}
          anchorRef={anchorRef}
        >
          <div className="flex flex-col gap-2">
            <p className="m-0 font-['Outfit',sans-serif] text-[18px] leading-[20px] font-semibold text-[var(--color-text-primary)]">
              {t("templatesEditor.toolbar.style")}
            </p>
            <div className="flex items-center gap-2">
              {HEAD_OPTIONS.map((style) => (
                <button
                  key={style || "none"}
                  type="button"
                  className={optionButtonClass(currentHead === style)}
                  onClick={() => handleHeadChange(style)}
                >
                  {icons[style]}
                </button>
              ))}
            </div>
          </div>
        </ToolbarPopover>
      </>
    );
  }
);
