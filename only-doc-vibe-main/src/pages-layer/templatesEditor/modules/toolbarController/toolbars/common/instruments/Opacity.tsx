import { useState, useRef, useCallback, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../../../../../ui/IconButton";
import { Tooltip } from "../../../../../ui/Tooltip";
import { ToolbarPopover } from "../../../../../ui/ToolbarPopover";
import { Slider } from "../../../../../ui/Slider";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

interface OpacityInstrumentProps {
  store: StoreType;
}

export const OpacityInstrument: FC<OpacityInstrumentProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const anchorRef = useRef<HTMLSpanElement>(null);
    const elements = store.selectedElements as unknown as AnyElement[];

    const currentOpacity =
      elements.length > 0 ? Math.round((elements[0].opacity ?? 1) * 100) : 100;

    const handleToggle = useCallback(() => {
      setIsOpen((prev) => !prev);
    }, []);

    const handleClose = useCallback(() => {
      setIsOpen(false);
    }, []);

    const handleChange = useCallback(
      (value: number) => {
        elements.forEach((el: AnyElement) => el.set({ opacity: value / 100 }));
      },
      [elements]
    );

    return (
      <>
        <span ref={anchorRef} className="inline-flex">
          <Tooltip content={t("templatesEditor.toolbar.opacity") as string}>
            <IconButton
              iconName="opacity"
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
          <div className="w-[312px]">
            <Slider
              label={t("templatesEditor.toolbar.intensity") as string}
              value={currentOpacity}
              min={0}
              max={100}
              suffix="%"
              onChange={handleChange}
            />
          </div>
        </ToolbarPopover>
      </>
    );
  }
);
