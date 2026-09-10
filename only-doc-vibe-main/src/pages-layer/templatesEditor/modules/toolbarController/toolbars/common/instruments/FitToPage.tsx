import { type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../../../../../ui/IconButton";
import { Tooltip } from "../../../../../ui/Tooltip";
import { useFitToPageElements } from "../../../../../helpers/fitToPageElements";

interface FitToPageInstrumentProps {
  store: StoreType;
}

export const FitToPageInstrument: FC<FitToPageInstrumentProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const { handleFitToPage } = useFitToPageElements({ store });

    return (
      <Tooltip content={t("templatesEditor.toolbar.fit_to_page") as string}>
        <IconButton iconName="fit_page" onClick={handleFitToPage} />
      </Tooltip>
    );
  }
);
