import { useState, useRef, useCallback, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { cn } from "@/shared/lib/utils/cn";
import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../../../../../ui/IconButton";
import { Tooltip } from "../../../../../ui/Tooltip";
import { ToolbarPopover } from "../../../../../ui/ToolbarPopover";
import { Slider } from "../../../../../ui/Slider";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

type DashStyle = "solid" | "long-dash" | "short-dash" | "dotted";

const DASH_MAP: Record<DashStyle, number[]> = {
  solid: [],
  "long-dash": [4, 1],
  "short-dash": [2, 1],
  dotted: [1, 1],
};

const getDashStyle = (el: AnyElement): DashStyle => {
  const dash: number[] | undefined = el.dash;
  if (!dash || dash.length === 0) return "solid";

  if (dash[0] >= 4) return "long-dash";

  if (dash[0] >= 2) return "short-dash";

  return "dotted";
};

const optionButtonClass = (active: boolean): string =>
  cn(
    "flex h-10 w-10 cursor-pointer items-center justify-center rounded-[8px] border border-[var(--color-action-stroke)] bg-[var(--color-bg-white-bg)] p-2 text-[#323232] outline-none hover:border-[var(--color-primary-opacity-50)] hover:bg-[var(--color-primary-opacity-12)] hover:text-[var(--color-primary)]",
    active &&
      "border-[var(--color-primary-opacity-50)] bg-[var(--color-primary-opacity-12)] text-[var(--color-primary)] shadow-[0_0_0_4px_var(--color-primary-opacity-12),inset_0_1px_4px_0_var(--color-primary-opacity-24),inset_0_-1px_4px_0_var(--color-primary-opacity-24)]"
  );

interface LineStyleInstrumentProps {
  store: StoreType;
}

export const LineStyleInstrument: FC<LineStyleInstrumentProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const anchorRef = useRef<HTMLSpanElement>(null);
    const elements = store.selectedElements as unknown as AnyElement[];

    const firstEl = elements[0];
    const currentSize = firstEl ? Math.round(firstEl.height ?? 2) : 2;
    const currentDash = firstEl ? getDashStyle(firstEl) : "solid";

    const handleToggle = useCallback(() => setIsOpen((prev) => !prev), []);
    const handleClose = useCallback(() => setIsOpen(false), []);

    const handleSizeChange = useCallback(
      (value: number) => {
        elements.forEach((el: AnyElement) => el.set({ height: value }));
      },
      [elements]
    );

    const handleDashChange = useCallback(
      (style: DashStyle) => {
        elements.forEach((el: AnyElement) => el.set({ dash: DASH_MAP[style] }));
      },
      [elements]
    );

    return (
      <>
        <span ref={anchorRef} className="inline-flex">
          <Tooltip content={t("templatesEditor.toolbar.line_style") as string}>
            <IconButton
              iconName="line_style"
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
            <Slider
              label={t("templatesEditor.toolbar.line_size") as string}
              value={currentSize}
              min={1}
              max={100}
              onChange={handleSizeChange}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={optionButtonClass(currentDash === "solid")}
                onClick={() => handleDashChange("solid")}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                  <line
                    x1="3"
                    y1="12"
                    x2="21"
                    y2="12"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>
              <button
                type="button"
                className={optionButtonClass(currentDash === "long-dash")}
                onClick={() => handleDashChange("long-dash")}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                  <line
                    x1="3"
                    y1="12"
                    x2="21"
                    y2="12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                  />
                </svg>
              </button>
              <button
                type="button"
                className={optionButtonClass(currentDash === "short-dash")}
                onClick={() => handleDashChange("short-dash")}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                  <line
                    x1="3"
                    y1="12"
                    x2="21"
                    y2="12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="3 2"
                  />
                </svg>
              </button>
              <button
                type="button"
                className={optionButtonClass(currentDash === "dotted")}
                onClick={() => handleDashChange("dotted")}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                  <line
                    x1="4"
                    y1="12"
                    x2="20"
                    y2="12"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeDasharray="0.5 3"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </ToolbarPopover>
      </>
    );
  }
);
