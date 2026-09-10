import { type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../../../../../ui/IconButton";
import { Tooltip, type TooltipPlacement } from "../../../../../ui/Tooltip";
import { useDeleteElements } from "../../../../../helpers/deleteElements";
import { useLockElements } from "../../../../../helpers/lockElements";

interface DeleteInstrumentProps {
  store: StoreType;
  position?: TooltipPlacement;
}

export const DeleteInstrument: FC<DeleteInstrumentProps> = observer(
  ({ store, position }) => {
    const { t } = useTranslation();
    const { handleDelete } = useDeleteElements({ store });
    const { isLocked } = useLockElements({ store });

    return (
      <Tooltip
        content={t("templatesEditor.common.delete") as string}
        placement={position}
      >
        <IconButton
          iconName="delete_forever"
          onClick={handleDelete}
          disabled={isLocked}
        />
      </Tooltip>
    );
  }
);
