import { type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../../../../../ui/IconButton";
import { Tooltip } from "../../../../../ui/Tooltip";
import { useCopyStyleElements } from "../../../../../helpers/copyStyleElements";

interface CopyStyleInstrumentProps {
  store: StoreType;
}

export const CopyStyleInstrument: FC<CopyStyleInstrumentProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const { handleCopyStyle, isCopyStyleActive, isCopyStyleDisabled } =
      useCopyStyleElements({ store });

    return (
      <Tooltip content={t("templatesEditor.toolbar.copy_style") as string}>
        <IconButton
          iconName="imagesearch_roller"
          onClick={handleCopyStyle}
          active={isCopyStyleActive}
          disabled={isCopyStyleDisabled}
        />
      </Tooltip>
    );
  }
);
