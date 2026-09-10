import { type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import RightGroup from "../common/RightGroup";
import { LeftGroup, ToolbarItem } from "../common/leftGroup/LeftGroup";
import { BorderInstrument } from "../common/instruments/Border";
import { EffectsInstrument } from "../common/instruments/Effects";
import { CopyInstrument } from "../common/instruments/Copy";
import { CopyStyleInstrument } from "../common/instruments/CopyStyle";
import { FitToPageInstrument } from "../common/instruments/FitToPage";
import { FlipInstrument } from "../common/instruments/Flip";
import { MaskInstrument } from "../common/instruments/Mask";
import { OpacityInstrument } from "../common/instruments/Opacity";
import { CropInstrument } from "../common/instruments/Crop";
import { PositionInstrument } from "../common/instruments/Position";
import { CropToolbar } from "./CropToolbar";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

interface ImageToolbarProps {
  store: StoreType;
}

export const ImageToolbar: FC<ImageToolbarProps> = observer(({ store }) => {
  const { t } = useTranslation();
  const element = store.selectedElements[0] as AnyElement;
  const isCropMode = element?._cropModeEnabled;

  if (isCropMode) {
    return <CropToolbar store={store} />;
  }

  return (
    <div className="flex w-full items-center justify-between rounded-[16px] bg-[var(--color-bg-white-bg)] p-[10px] shadow-[0px_4px_10px_0px_rgba(91,91,91,0.16)]">
      <LeftGroup store={store}>
        <ToolbarItem
          iconName="flip"
          label={t("templatesEditor.toolbar.flip") as string}
        >
          <FlipInstrument store={store} />
        </ToolbarItem>
        <ToolbarItem
          iconName="fit_page"
          label={t("templatesEditor.toolbar.fit_to_page") as string}
        >
          <FitToPageInstrument store={store} />
        </ToolbarItem>
        <ToolbarItem
          iconName="masked_transitions"
          label={t("templatesEditor.toolbar.mask") as string}
        >
          <MaskInstrument />
        </ToolbarItem>
        <ToolbarItem
          iconName="crop"
          label={t("templatesEditor.toolbar.crop") as string}
        >
          <CropInstrument store={store} />
        </ToolbarItem>
        <ToolbarItem
          iconName="border_style"
          label={t("templatesEditor.toolbar.border") as string}
        >
          <BorderInstrument store={store} />
        </ToolbarItem>
        <ToolbarItem
          iconName="opacity"
          label={t("templatesEditor.toolbar.opacity") as string}
        >
          <OpacityInstrument store={store} />
        </ToolbarItem>
        <ToolbarItem
          iconName="wb_iridescent"
          label={t("templatesEditor.toolbar.effects") as string}
        >
          <EffectsInstrument sidePanel="photo" />
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
