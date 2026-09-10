import { useCallback, useRef, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { ColorControl } from "../ColorControl";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

interface TableBackgroundColorInstrumentProps {
  store: StoreType;
}

export const TableBackgroundColorInstrument: FC<TableBackgroundColorInstrumentProps> =
  observer(({ store }) => {
    const { t } = useTranslation();
    const elements = store.selectedElements as unknown as AnyElement[];
    const table: AnyElement | undefined = elements[0];
    const focusedCellsRef = useRef<AnyElement[]>([]);

    const liveFocused: AnyElement[] = table?.focusedCells ?? [];
    if (liveFocused.length > 0) {
      focusedCellsRef.current = liveFocused;
    }

    const targetCells = focusedCellsRef.current;

    const initialColor = (() => {
      if (!table) return "#ffffff";

      if (targetCells.length > 0)
        return (targetCells[0].cellBackground as string) ?? "#ffffff";

      return (table.cellBackground as string) ?? "#ffffff";
    })();

    const handleColorSelect = useCallback(
      (value: string) => {
        const cells = focusedCellsRef.current;
        store.history.transaction(() => {
          if (cells.length > 0) {
            cells.forEach((cell: AnyElement) => {
              cell.set({ _cellBackground: value });
            });
          } else {
            elements.forEach((el: AnyElement) => {
              el.set({ cellBackground: value });
            });
          }
        });
      },
      [store, elements]
    );

    return (
      <ColorControl
        iconName="colors"
        tooltipContent={t("templatesEditor.toolbar.background_color") as string}
        initialColor={initialColor}
        onSelect={handleColorSelect}
        solidOnly
      />
    );
  });
