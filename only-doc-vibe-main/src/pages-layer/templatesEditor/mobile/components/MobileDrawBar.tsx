import { type FC, useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { Slider } from "../../ui/Slider";
import { HorizontalTabs } from "../../ui/HorizontalTabs";
import { IconButton } from "../../ui/IconButton";
import AdvancedColorPicker from "../../components/advancedColorPicker/AdvancedColorPicker";
import { QUICK_STRIP_COLORS } from "../../constants/colors";
import { useAnchoredStrip } from "../../helpers/useAnchoredStrip";
import { useTemplatesEditorStore } from "../../model/store/templates-editor-store";

interface MobileDrawBarProps {
  store: StoreType;
}

type OpenControl = "none" | "colors" | "stroke";

const STROKE_MIN = 1;
const STROKE_MAX = 50;

const SWATCH_BASE =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-black/[0.08] p-0";

export const MobileDrawBar: FC<MobileDrawBarProps> = observer(({ store }) => {
  const { t } = useTranslation();
  const setMobileDrawMode = useTemplatesEditorStore.use.setMobileDrawMode();

  const [openControl, setOpenControl] = useState<OpenControl>("none");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const stroke = (store.toolOptions.stroke as string) || "#000000";
  const strokeWidth = store.toolOptions.strokeWidth || 5;
  const brushType =
    store.toolOptions.brushType === "highlighter" ? "highlighter" : "brush";

  const DRAW_TOOLS = useMemo(
    () =>
      [
        {
          id: "brush",
          icon: "stylus_pen",
          label: t("templatesEditor.mobile.pencil") as string,
        },
        {
          id: "highlighter",
          icon: "stylus_highlighter",
          label: t("templatesEditor.mobile.highlighter") as string,
        },
      ] as const,
    [t]
  );

  const activeToolLabel = DRAW_TOOLS.find(
    (tool) => tool.id === brushType
  )?.label;

  const coords = useAnchoredStrip({
    open: openControl !== "none",
    anchorRef: navRef,
    popRef,
    fixedWidth: openControl === "stroke" ? 320 : undefined,
  });

  const closePopovers = useCallback(() => setOpenControl("none"), []);

  const handleToggleColors = useCallback(
    () => setOpenControl((prev) => (prev === "colors" ? "none" : "colors")),
    []
  );
  const handleToggleStroke = useCallback(
    () => setOpenControl((prev) => (prev === "stroke" ? "none" : "stroke")),
    []
  );

  const handleColorSelect = useCallback(
    (color: string) => {
      store.setToolOptions({ stroke: color });
    },
    [store]
  );

  const handlePickPreset = useCallback(
    (color: string) => {
      handleColorSelect(color);
      setOpenControl("none");
    },
    [handleColorSelect]
  );

  const handleOpenFullPicker = useCallback(() => {
    setOpenControl("none");
    setIsSheetOpen(true);
  }, []);

  const handleStrokeWidthChange = useCallback(
    (value: number) => {
      store.setToolOptions({ strokeWidth: value });
    },
    [store]
  );

  const handleToolChange = useCallback(
    (toolLabel: string) => {
      const tool = DRAW_TOOLS.find((item) => item.label === toolLabel)?.id;
      if (!tool) return;

      store.setToolOptions({
        brushType: tool === "highlighter" ? "highlighter" : "brush",
        opacity: tool === "highlighter" ? 0.5 : 1,
        strokeWidth: tool === "highlighter" ? 30 : strokeWidth || 5,
      });
    },
    [store, strokeWidth, DRAW_TOOLS]
  );

  const handleFinish = useCallback(() => {
    setOpenControl("none");
    setIsSheetOpen(false);
    setMobileDrawMode(false);
  }, [setMobileDrawMode]);

  const popStyle = coords
    ? { top: coords.top, left: coords.left, width: coords.width }
    : { visibility: "hidden" as const };

  const colorsStrip = (
    <>
      <div className="fixed inset-0 z-[99]" onClick={closePopovers} />
      <div
        ref={popRef}
        className="fixed z-[1000] flex items-stretch overflow-hidden rounded-2xl bg-[var(--color-bg-white-bg)] p-2 shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
        style={popStyle}
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
      </div>
    </>
  );

  const strokePopover = (
    <>
      <div className="fixed inset-0 z-[99]" onClick={closePopovers} />
      <div
        ref={popRef}
        className="fixed z-[1000] flex flex-col gap-3 rounded-2xl bg-[var(--color-bg-white-bg)] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
        style={popStyle}
      >
        <HorizontalTabs
          activeTab={activeToolLabel}
          tabs={DRAW_TOOLS as unknown as { icon: string; label: string }[]}
          onClick={handleToolChange}
        />
        <Slider
          label={t("templatesEditor.mobile.stroke_width") as string}
          value={strokeWidth}
          min={STROKE_MIN}
          max={STROKE_MAX}
          onChange={handleStrokeWidthChange}
        />
      </div>
    </>
  );

  const fullSheet = (
    <div className="fixed inset-x-0 bottom-0 z-[1001] flex max-h-[80dvh] flex-col overflow-y-auto rounded-t-[20px] bg-[var(--color-bg-white-bg)] px-4 pt-2 pb-[calc(16px+env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-2 py-2">
        <h3 className="m-0 truncate [font-family:'Outfit',sans-serif] text-[18px] font-bold text-[var(--color-text-primary)]">
          {t("templatesEditor.mobile.color") as string}
        </h3>
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
        solidOnly
        initialValue={stroke}
        onSelect={handleColorSelect}
      />
    </div>
  );

  return (
    <nav
      ref={navRef}
      className="relative z-[101] shrink-0 px-2 pt-2 pb-[calc(10px+env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex w-max max-w-full items-stretch rounded-[20px] bg-[var(--color-bg-white-bg)] shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
        <div className="flex min-w-0 items-center gap-1.5 p-2">
          <button
            type="button"
            onClick={handleToggleColors}
            className={SWATCH_BASE}
            style={{ background: stroke }}
            aria-label={t("templatesEditor.mobile.color") as string}
          />
          <button
            type="button"
            onClick={handleOpenFullPicker}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-[3px] border-transparent p-0 [background:linear-gradient(var(--color-bg-white-bg),var(--color-bg-white-bg))_padding-box,conic-gradient(from_90deg,#ff3b30,#ff9500,#ffcc00,#34c759,#00c7be,#007aff,#af52de,#ff2d55,#ff3b30)_border-box]"
            aria-label={t("templatesEditor.mobile.color") as string}
          >
            <span className="material-symbols-rounded text-2xl text-black/45">
              add
            </span>
          </button>
          <IconButton
            iconName="line_weight"
            active={openControl === "stroke"}
            onClick={handleToggleStroke}
          />
        </div>
        <div className="flex shrink-0 items-center gap-1.5 border-s border-black/[0.08] p-2">
          <IconButton iconName="close" onClick={handleFinish} />
        </div>
      </div>

      {openControl === "colors" && createPortal(colorsStrip, document.body)}
      {openControl === "stroke" && createPortal(strokePopover, document.body)}
      {isSheetOpen && createPortal(fullSheet, document.body)}
    </nav>
  );
});
