import { type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import RightGroup from "./common/RightGroup";
import { LeftGroup, ToolbarItem } from "./common/leftGroup/LeftGroup";
import { CopyInstrument } from "./common/instruments/Copy";
import { CopyStyleInstrument } from "./common/instruments/CopyStyle";
import { FillColorInstrument } from "./common/instruments/FillColor";
import { LineStyleInstrument } from "./common/instruments/LineStyle";
import { LineHeadInstrument } from "./common/instruments/LineHead";
import { PositionInstrument } from "./common/instruments/Position";

interface LinesToolbarProps {
  store: StoreType;
}

export const LinesToolbar: FC<LinesToolbarProps> = observer(({ store }) => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full items-center justify-between rounded-[16px] bg-[var(--color-bg-white-bg)] p-[10px] shadow-[0px_4px_10px_0px_rgba(91,91,91,0.16)]">
      <LeftGroup store={store}>
        <ToolbarItem
          iconName="colors"
          label={t("templatesEditor.toolbar.color") as string}
        >
          <FillColorInstrument store={store} colorProperty="color" />
        </ToolbarItem>
        <ToolbarItem
          iconName="line_style"
          label={t("templatesEditor.toolbar.line_style") as string}
        >
          <LineStyleInstrument store={store} />
        </ToolbarItem>
        <ToolbarItem
          iconName="arrow_back"
          label={t("templatesEditor.toolbar.line_start") as string}
        >
          <LineHeadInstrument
            store={store}
            property="startHead"
            iconName="arrow_back"
            tooltipContent={t("templatesEditor.toolbar.line_start") as string}
          />
        </ToolbarItem>
        <ToolbarItem
          iconName="arrow_forward"
          label={t("templatesEditor.toolbar.line_end") as string}
        >
          <LineHeadInstrument
            store={store}
            property="endHead"
            iconName="arrow_forward"
            tooltipContent={t("templatesEditor.toolbar.line_end") as string}
          />
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
