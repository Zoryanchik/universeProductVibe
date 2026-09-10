import { type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import RightGroup from "./common/RightGroup";
import { LeftGroup, ToolbarItem } from "./common/leftGroup/LeftGroup";
import { BorderInstrument } from "./common/instruments/Border";
import { EffectsInstrument } from "./common/instruments/Effects";
import { CopyInstrument } from "./common/instruments/Copy";
import { CopyStyleInstrument } from "./common/instruments/CopyStyle";
import { FillColorInstrument } from "./common/instruments/FillColor";
import { PositionInstrument } from "./common/instruments/Position";

interface ShapesToolbarProps {
  store: StoreType;
}

export const ShapesToolbar: FC<ShapesToolbarProps> = observer(({ store }) => {
  const { t } = useTranslation();
  const elements = store.selectedElements;
  const isSVG = elements.every((el) => el.type === "svg");

  return (
    <div className="flex w-full items-center justify-between rounded-[16px] bg-[var(--color-bg-white-bg)] p-[10px] shadow-[0px_4px_10px_0px_rgba(91,91,91,0.16)]">
      <LeftGroup store={store}>
        <ToolbarItem
          iconName="colors"
          label={t("templatesEditor.toolbar.fill_color") as string}
        >
          <FillColorInstrument store={store} />
        </ToolbarItem>
        <ToolbarItem
          iconName="border_style"
          label={t("templatesEditor.toolbar.border") as string}
        >
          <BorderInstrument store={store} />
        </ToolbarItem>
        <ToolbarItem
          iconName="wb_iridescent"
          label={t("templatesEditor.toolbar.effects") as string}
        >
          <EffectsInstrument sidePanel={isSVG ? "photo" : "shapes"} />
        </ToolbarItem>
        <ToolbarItem
          iconName="align_center"
          label={t("templatesEditor.toolbar.position") as string}
        >
          <PositionInstrument store={store} />
        </ToolbarItem>
        <ToolbarItem
          iconName="content_copy"
          label={t("templatesEditor.toolbar.copy") as string}
        >
          <CopyInstrument store={store} />
        </ToolbarItem>
        <ToolbarItem
          iconName="imagesearch_roller"
          label={t("templatesEditor.toolbar.copy_style") as string}
        >
          <CopyStyleInstrument store={store} />
        </ToolbarItem>
      </LeftGroup>
      <RightGroup store={store} />
    </div>
  );
});
