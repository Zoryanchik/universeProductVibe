import { type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../../../../../ui/IconButton";
import { Tooltip, type TooltipPlacement } from "../../../../../ui/Tooltip";
import { useCopyElements } from "../../../../../helpers/copyElements";

interface CopyInstrumentProps {
  store: StoreType;
  position?: TooltipPlacement;
}

export const CopyInstrument: FC<CopyInstrumentProps> = observer(
  ({ store, position }) => {
    const { t } = useTranslation();
    const { handleCopy } = useCopyElements({ store });

    return (
      <Tooltip
        content={t("templatesEditor.toolbar.copy") as string}
        placement={position}
      >
        <IconButton iconName="content_copy" onClick={handleCopy} />
      </Tooltip>
    );
  }
);
