import { type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import RightGroup from "./common/RightGroup";
import { LeftGroup, ToolbarItem } from "./common/leftGroup/LeftGroup";
import { FontFamilyInstrument } from "./common/instruments/FontFamily";
import { FontSizeInstrument } from "./common/instruments/FontSize";
import { TextStyleInstrument } from "./common/instruments/TextStyle";
import { FillColorInstrument } from "./common/instruments/FillColor";
import { TextAlignInstrument } from "./common/instruments/TextAlign";
import { VerticalAlignInstrument } from "./common/instruments/VerticalAlign";
import { FitToPageInstrument } from "./common/instruments/FitToPage";
import { OpacityInstrument } from "./common/instruments/Opacity";
import { EffectsInstrument } from "./common/instruments/Effects";
import { PositionInstrument } from "./common/instruments/Position";
import { CopyInstrument } from "./common/instruments/Copy";
import { CopyStyleInstrument } from "./common/instruments/CopyStyle";

interface TextToolbarProps {
  store: StoreType;
}

export const TextToolbar: FC<TextToolbarProps> = observer(({ store }) => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full items-center justify-between rounded-[16px] bg-[var(--color-bg-white-bg)] p-[10px] shadow-[0px_4px_10px_0px_rgba(91,91,91,0.16)]">
      <LeftGroup store={store}>
        <FontFamilyInstrument store={store} />
        <FontSizeInstrument store={store} />
        <ToolbarItem
          iconName="format_bold"
          label={t("templatesEditor.toolbar.text_style") as string}
        >
          <TextStyleInstrument store={store} />
        </ToolbarItem>
        <ToolbarItem
          iconName="format_color_text"
          label={t("templatesEditor.toolbar.text_color") as string}
        >
          <FillColorInstrument
            store={store}
            colorProperty="fill"
            iconName="format_color_text"
            tooltipContent={t("templatesEditor.toolbar.text_color") as string}
          />
        </ToolbarItem>
        <ToolbarItem
          iconName="format_align_left"
          label={t("templatesEditor.toolbar.text_align") as string}
        >
          <TextAlignInstrument store={store} />
        </ToolbarItem>
        <ToolbarItem
          iconName="vertical_align_top"
          label={t("templatesEditor.toolbar.vertical_align") as string}
        >
          <VerticalAlignInstrument store={store} />
        </ToolbarItem>
        <ToolbarItem
          iconName="fit_page"
          label={t("templatesEditor.toolbar.fit_to_page") as string}
        >
          <FitToPageInstrument store={store} />
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
          <EffectsInstrument sidePanel="text" />
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
