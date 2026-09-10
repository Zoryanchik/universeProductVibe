import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";
import { useCallback, type FC } from "react";

import { useTranslation } from "@/shared/lib/translations";

import { SidePanelSectionLabel } from "../../../../../ui/SidePanelSectionLabel";
import { CustomScrollArea } from "../../../../../ui/CustomScrollArea";
import { useTemplatesEditorStore } from "../../../../../model/store/templates-editor-store";
import { ShadowEffect } from "../../common/effects/Shadow";
import { BorderEffect } from "../../common/effects/Border";
import { useEffectsTabSwitch } from "../../common/effects/useEffectsTabSwitch";

interface ShapesEffectsPanelProps {
  store: StoreType;
}

const SHAPE_TYPES = ["figure"];

export const ShapesEffectsPanel: FC<ShapesEffectsPanelProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const setEffectsMode = useTemplatesEditorStore.use.setEffectsMode();

    useEffectsTabSwitch(store, SHAPE_TYPES);

    const handleClose = useCallback(() => {
      setEffectsMode(false);
    }, [setEffectsMode]);

    return (
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-e-[24px]">
        <div className="box-border flex w-full flex-shrink-0 items-center justify-between px-5 pt-5">
          <SidePanelSectionLabel
            label={
              t(
                "templatesEditor.side_panel.headers.effects_for_shapes"
              ) as string
            }
            type="header"
          />
          <button
            type="button"
            onClick={handleClose}
            className="flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0 text-[var(--color-action-main,black)]"
          >
            <span className="material-symbols-rounded text-2xl">close</span>
          </button>
        </div>

        <CustomScrollArea className="min-h-0 w-full flex-1">
          <div className="flex flex-col">
            <div className="box-border flex w-full flex-col gap-2 p-5">
              <BorderEffect store={store} />
              <ShadowEffect store={store} />
            </div>
          </div>
        </CustomScrollArea>
      </div>
    );
  }
);
