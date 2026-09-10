import type { FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import RightGroup from "./common/RightGroup";
import { LeftGroup, ToolbarItem } from "./common/leftGroup/LeftGroup";
import { CopyInstrument } from "./common/instruments/Copy";
import { PositionInstrument } from "./common/instruments/Position";
import { CopyStyleInstrument } from "./common/instruments/CopyStyle";
import { TableBorderInstrument } from "./common/instruments/TableBorder";
import { TableStructureInstrument } from "./common/instruments/TableStructure";
import { TableBackgroundColorInstrument } from "./common/instruments/TableBackgroundColor";

interface TableToolbarProps {
  store: StoreType;
}

export const TableToolbar: FC<TableToolbarProps> = observer(({ store }) => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full items-center justify-between rounded-[16px] bg-[var(--color-bg-white-bg)] p-[10px] shadow-[0px_4px_10px_0px_rgba(91,91,91,0.16)]">
      <LeftGroup store={store}>
        <ToolbarItem
          iconName="colors"
          label={t("templatesEditor.toolbar.background_color") as string}
        >
          <TableBackgroundColorInstrument store={store} />
        </ToolbarItem>
        <ToolbarItem
          iconName="border_style"
          label={t("templatesEditor.toolbar.table_border") as string}
        >
          <TableBorderInstrument store={store} />
        </ToolbarItem>
        <ToolbarItem
          iconName="border_all"
          label={t("templatesEditor.toolbar.structure") as string}
        >
          <TableStructureInstrument store={store} />
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
