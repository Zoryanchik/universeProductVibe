import { type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../../../../../ui/IconButton";
import { Tooltip, type TooltipPlacement } from "../../../../../ui/Tooltip";
import { useLockElements } from "../../../../../helpers/lockElements";

interface LockInstrumentProps {
  store: StoreType;
  position?: TooltipPlacement;
}

export const LockInstrument: FC<LockInstrumentProps> = observer(
  ({ store, position }) => {
    const { t } = useTranslation();
    const { isLocked, handleLock } = useLockElements({ store });

    return (
      <Tooltip
        content={
          (isLocked
            ? t("templatesEditor.common.unlock")
            : t("templatesEditor.toolbar.lock")) as string
        }
        placement={position}
      >
        <IconButton
          iconName={isLocked ? "lock" : "lock_open"}
          onClick={handleLock}
          active={isLocked}
        />
      </Tooltip>
    );
  }
);
