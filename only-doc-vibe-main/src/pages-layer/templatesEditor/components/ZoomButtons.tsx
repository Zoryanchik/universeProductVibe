import { useMemo, useRef, useState, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { DropdownMenu, type DropdownMenuOption } from "../ui/DropdownMenu";

const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;

const ZOOM_LEVELS = ["3", "2", "1.5", "1", "0.75", "0.5", "0.25", "0.1"];

interface ZoomButtonsProps {
  store: StoreType;
}

export const ZoomButtons: FC<ZoomButtonsProps> = observer(({ store }) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const labelRef = useRef<HTMLSpanElement>(null);

  const zoomPresets = useMemo<DropdownMenuOption[]>(
    () => [
      ...ZOOM_LEVELS.map((value) => ({
        label: `${Math.round(Number(value) * 100)}%`,
        value,
      })),
      { label: t("templatesEditor.ui.reset") as string, value: "reset" },
    ],
    [t]
  );

  const zoomPercent = Math.round(store.scale * 100);

  const handleZoomOut = () => {
    const next = Math.max(MIN_ZOOM, store.scale - ZOOM_STEP);
    store.setScale(next);
  };

  const handleZoomIn = () => {
    const next = Math.min(MAX_ZOOM, store.scale + ZOOM_STEP);
    store.setScale(next);
  };

  const handleZoomSelect = (value: string) => {
    if (value === "reset") {
      store.setScale(1);

      return;
    }

    store.setScale(Number(value));
  };

  return (
    <div className="flex items-center gap-2 rounded-[10px] bg-[rgba(0,0,0,0.08)] p-[2px] backdrop-blur-[8px] outline-none">
      <button
        type="button"
        onClick={handleZoomOut}
        disabled={store.scale <= MIN_ZOOM}
        className="flex shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-white p-1 outline-none enabled:hover:bg-[rgba(255,255,255,0.85)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="material-symbols-rounded text-2xl text-[#323232] [font-variation-settings:'FILL'_0,'wght'_300,'GRAD'_0,'opsz'_24]">
          remove
        </span>
      </button>

      <span
        ref={labelRef}
        onClick={() => setIsMenuOpen((prev) => !prev)}
        className="shrink-0 cursor-pointer rounded-lg px-1 py-[2px] text-center font-[Outfit,sans-serif] text-[16px] leading-[22px] font-normal whitespace-nowrap text-[rgba(0,0,0,0.87)] select-none hover:bg-[rgba(0,0,0,0.06)]"
      >
        {zoomPercent}%
      </span>

      <DropdownMenu
        options={zoomPresets}
        isOpen={isMenuOpen}
        onSelect={handleZoomSelect}
        onClose={() => setIsMenuOpen(false)}
        anchorRef={labelRef}
      />

      <button
        type="button"
        onClick={handleZoomIn}
        disabled={store.scale >= MAX_ZOOM}
        className="flex shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-white p-1 outline-none enabled:hover:bg-[rgba(255,255,255,0.85)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="material-symbols-rounded text-2xl text-[#323232] [font-variation-settings:'FILL'_0,'wght'_300,'GRAD'_0,'opsz'_24]">
          add
        </span>
      </button>
    </div>
  );
});
