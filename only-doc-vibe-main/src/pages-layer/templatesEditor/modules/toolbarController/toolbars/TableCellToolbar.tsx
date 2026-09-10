import { useRef, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import RightGroup from "./common/RightGroup";
import { LeftGroup, ToolbarItem } from "./common/leftGroup/LeftGroup";
import { CopyInstrument } from "./common/instruments/Copy";
import { PositionInstrument } from "./common/instruments/Position";
import { CopyStyleInstrument } from "./common/instruments/CopyStyle";
import { FillColorInstrument } from "./common/instruments/FillColor";
import { TableBorderInstrument } from "./common/instruments/TableBorder";
import { TableStructureInstrument } from "./common/instruments/TableStructure";
import { TableBackgroundColorInstrument } from "./common/instruments/TableBackgroundColor";
import { FontFamilyInstrument } from "./common/instruments/FontFamily";
import { FontSizeInstrument } from "./common/instruments/FontSize";
import { TextStyleInstrument } from "./common/instruments/TextStyle";
import { TextAlignInstrument } from "./common/instruments/TextAlign";
import { VerticalAlignInstrument } from "./common/instruments/VerticalAlign";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

interface TableCellToolbarProps {
  store: StoreType;
}

export const TableCellToolbar: FC<TableCellToolbarProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const table = (store.selectedElements as unknown as AnyElement[])[0];
    const focusedCellsRef = useRef<AnyElement[]>([]);

    const liveFocused: AnyElement[] = table?.focusedCells ?? [];
    if (liveFocused.length > 0) {
      focusedCellsRef.current = liveFocused;
    }

    const cellElements = focusedCellsRef.current;

    return (
      <div className="flex w-full items-center justify-between rounded-[16px] bg-[var(--color-bg-white-bg)] p-[10px] shadow-[0px_4px_10px_0px_rgba(91,91,91,0.16)]">
        <LeftGroup store={store}>
          <FontFamilyInstrument store={store} elements={cellElements} />
          <FontSizeInstrument
            store={store}
            elements={cellElements}
            editable={false}
          />
          <ToolbarItem
            iconName="format_bold"
            label={t("templatesEditor.toolbar.text_style") as string}
          >
            <TextStyleInstrument store={store} elements={cellElements} />
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
              elements={cellElements}
            />
          </ToolbarItem>
          <ToolbarItem
            iconName="format_align_left"
            label={t("templatesEditor.toolbar.text_align") as string}
          >
            <TextAlignInstrument store={store} elements={cellElements} />
          </ToolbarItem>
          <ToolbarItem
            iconName="vertical_align_top"
            label={t("templatesEditor.toolbar.vertical_align") as string}
          >
            <VerticalAlignInstrument store={store} elements={cellElements} />
          </ToolbarItem>
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
            <TableStructureInstrument store={store} isTableCell />
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
  }
);
