import { useState, useRef, useCallback, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../../../../../ui/IconButton";
import { Tooltip } from "../../../../../ui/Tooltip";
import { ToolbarPopover } from "../../../../../ui/ToolbarPopover";
import { OptionItem } from "../../../../../components/OptionItem";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

interface FlipInstrumentProps {
  store: StoreType;
}

export const FlipInstrument: FC<FlipInstrumentProps> = observer(({ store }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const elements = store.selectedElements as unknown as AnyElement[];

  const handleFlipX = useCallback(() => {
    elements.forEach((el: AnyElement) => el.set({ flipX: !el.flipX }));
    setIsOpen(false);
  }, [elements]);

  const handleFlipY = useCallback(() => {
    elements.forEach((el: AnyElement) => el.set({ flipY: !el.flipY }));
    setIsOpen(false);
  }, [elements]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <span ref={anchorRef} className="inline-flex">
        <Tooltip content={t("templatesEditor.toolbar.flip") as string}>
          <IconButton iconName="flip" onClick={handleToggle} active={isOpen} />
        </Tooltip>
      </span>
      <ToolbarPopover
        label={t("templatesEditor.toolbar.flip") as string}
        isOpen={isOpen}
        onClose={handleClose}
        anchorRef={anchorRef}
      >
        <div className="flex items-start gap-[15px]">
          <OptionItem
            iconName="flip"
            label={t("templatesEditor.toolbar.horizontal") as string}
            onClick={handleFlipX}
          />
          <div
            className="flex flex-[1_0_0] cursor-pointer items-center gap-2"
            onClick={handleFlipY}
          >
            <span className="inline-flex -rotate-90">
              <IconButton iconName="flip" onClick={handleFlipY} />
            </span>
            <span className="font-['Outfit',sans-serif] text-[16px] leading-[22px] font-normal whitespace-nowrap text-[var(--color-text-primary)]">
              {t("templatesEditor.toolbar.vertical")}
            </span>
          </div>
        </div>
      </ToolbarPopover>
    </>
  );
});
