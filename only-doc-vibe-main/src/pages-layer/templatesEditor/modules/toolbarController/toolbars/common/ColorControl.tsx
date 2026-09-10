import { useState, useCallback, useRef, type FC } from "react";
import { createPortal } from "react-dom";

import { isMobileDevice } from "@/shared/lib/device/is-mobile";

import { IconButton } from "../../../../ui/IconButton";
import { Tooltip } from "../../../../ui/Tooltip";
import AdvancedColorPicker from "../../../../components/advancedColorPicker/AdvancedColorPicker";
import { QUICK_STRIP_COLORS } from "../../../../constants/colors";
import { useAnchoredStrip } from "../../../../helpers/useAnchoredStrip";

interface ColorControlProps {
  initialColor: string;
  onSelect: (value: string) => void;
  iconName?: string;
  tooltipContent: string;
  solidOnly?: boolean;
}

const SWATCH_BASE =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-black/[0.08] p-0";

/**
 * Trigger button + color picker shared by every fill/background instrument.
 *
 * - Desktop: a floating overlay picker anchored to the button.
 * - Mobile: a quick-color strip above the toolbar with a "+" that opens the
 *   full-picker bottom sheet (the overlay variant is unusable on touch).
 */
export const ColorControl: FC<ColorControlProps> = ({
  initialColor,
  onSelect,
  iconName = "colors",
  tooltipContent,
  solidOnly,
}) => {
  const isMobile = isMobileDevice();

  const [isOpen, setIsOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  const stripCoords = useAnchoredStrip({
    open: isOpen && isMobile,
    anchorRef,
    popRef: stripRef,
  });

  const handlePickPreset = useCallback(
    (color: string) => {
      onSelect(color);
      setIsOpen(false);
    },
    [onSelect]
  );

  const handleOpenFullPicker = useCallback(() => {
    setIsOpen(false);
    setIsSheetOpen(true);
  }, []);

  const handleBackToStrip = useCallback(() => {
    setIsSheetOpen(false);
    setIsOpen(true);
  }, []);

  const quickStrip = (
    <>
      <div className="fixed inset-0 z-[99]" onClick={handleClose} />
      <div
        ref={stripRef}
        className="fixed z-[1000] flex items-stretch overflow-hidden rounded-2xl bg-[var(--color-bg-white-bg)] p-2 shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
        style={
          stripCoords
            ? {
                top: stripCoords.top,
                left: stripCoords.left,
                width: stripCoords.width,
              }
            : { visibility: "hidden" }
        }
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pe-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {QUICK_STRIP_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handlePickPreset(color)}
              className={SWATCH_BASE}
              style={{ background: color }}
              aria-label={color}
            />
          ))}
        </div>
        <div className="flex shrink-0 items-center border-s border-black/[0.08] ps-2">
          <button
            type="button"
            onClick={handleOpenFullPicker}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-[3px] border-transparent p-0 [background:linear-gradient(var(--color-bg-white-bg),var(--color-bg-white-bg))_padding-box,conic-gradient(from_90deg,#ff3b30,#ff9500,#ffcc00,#34c759,#00c7be,#007aff,#af52de,#ff2d55,#ff3b30)_border-box]"
            aria-label={tooltipContent}
          >
            <span className="material-symbols-rounded text-2xl text-black/45">
              add
            </span>
          </button>
        </div>
      </div>
    </>
  );

  const fullSheet = (
    <div className="fixed inset-x-0 bottom-0 z-[1001] flex max-h-[80dvh] flex-col overflow-y-auto rounded-t-[20px] bg-[var(--color-bg-white-bg)] px-4 pt-2 pb-[calc(16px+env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-2 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <IconButton
            iconName="arrow_back_ios_new"
            onClick={handleBackToStrip}
          />
          <h3 className="m-0 truncate [font-family:'Outfit',sans-serif] text-[18px] font-bold text-[var(--color-text-primary)]">
            {tooltipContent}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setIsSheetOpen(false)}
          className="flex h-10 w-10 shrink-0 items-center justify-center"
          aria-label="close"
        >
          <span className="material-symbols-rounded text-[26px] text-[var(--color-text-primary)]">
            close
          </span>
        </button>
      </div>
      <AdvancedColorPicker
        mode="sheet"
        initialValue={initialColor}
        onSelect={onSelect}
        solidOnly={solidOnly}
      />
    </div>
  );

  return (
    <div ref={anchorRef} className="relative inline-flex">
      <Tooltip content={tooltipContent}>
        <IconButton
          iconName={iconName}
          onClick={handleToggle}
          active={isOpen || isSheetOpen}
        />
      </Tooltip>

      {isMobile ? (
        <>
          {isOpen && createPortal(quickStrip, document.body)}
          {isSheetOpen && createPortal(fullSheet, document.body)}
        </>
      ) : (
        isOpen && (
          <>
            <div className="fixed inset-0 z-[99]" onClick={handleClose} />
            <AdvancedColorPicker
              mode="overlay"
              initialValue={initialColor}
              onSelect={onSelect}
              solidOnly={solidOnly}
            />
          </>
        )
      )}
    </div>
  );
};
