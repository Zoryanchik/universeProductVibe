import { useState, useRef, useCallback, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../../../../../ui/IconButton";
import { Tooltip } from "../../../../../ui/Tooltip";
import { ToolbarPopover } from "../../../../../ui/ToolbarPopover";
import { BorderControls } from "../../../../../components/BorderControls";

interface BorderInstrumentProps {
  store: StoreType;
}

export const BorderInstrument: FC<BorderInstrumentProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const anchorRef = useRef<HTMLSpanElement>(null);

    const handleToggle = useCallback(() => setIsOpen((prev) => !prev), []);
    const handleClose = useCallback(() => setIsOpen(false), []);

    return (
      <>
        <span ref={anchorRef} className="inline-flex">
          <Tooltip content={t("templatesEditor.toolbar.border") as string}>
            <IconButton
              iconName="border_style"
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
          <div className="flex w-[312px] flex-col gap-4">
            <BorderControls store={store} mode="instrument" />
          </div>
        </ToolbarPopover>
      </>
    );
  }
);
