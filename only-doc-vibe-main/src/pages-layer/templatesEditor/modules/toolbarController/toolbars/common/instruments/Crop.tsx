import { useCallback, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../../../../../ui/IconButton";
import { Tooltip } from "../../../../../ui/Tooltip";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

interface CropInstrumentProps {
  store: StoreType;
}

export const CropInstrument: FC<CropInstrumentProps> = observer(({ store }) => {
  const { t } = useTranslation();
  const element = store.selectedElements[0] as AnyElement;

  const handleClick = useCallback(() => {
    element?.toggleCropMode(true);
  }, [element]);

  return (
    <Tooltip content={t("templatesEditor.toolbar.crop") as string}>
      <IconButton iconName="crop" onClick={handleClick} disabled={!element} />
    </Tooltip>
  );
});
