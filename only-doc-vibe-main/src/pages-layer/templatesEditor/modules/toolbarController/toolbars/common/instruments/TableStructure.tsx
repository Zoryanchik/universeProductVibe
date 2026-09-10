import { useState, useRef, useCallback, useMemo, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../../../../../ui/IconButton";
import { Tooltip } from "../../../../../ui/Tooltip";
import { OptionItem } from "../../../../../components/OptionItem";
import { ToolbarPopover, PopoverLabel } from "../../../../../ui/ToolbarPopover";
import {
  DropdownMenu,
  type DropdownMenuOption,
} from "../../../../../ui/DropdownMenu";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

const DISTRIBUTE_OPTIONS: Omit<DropdownMenuOption, "label">[] = [
  {
    value: "rows",
    iconName: "border_horizontal",
  },
  {
    value: "columns",
    iconName: "border_vertical",
  },
];

const DISTRIBUTE_LABEL_KEYS: Record<string, string> = {
  rows: "templatesEditor.toolbar.distribute_rows_only",
  columns: "templatesEditor.toolbar.distribute_columns_only",
};

interface TableStructureInstrumentProps {
  store: StoreType;
  isTableCell?: boolean;
}

export const TableStructureInstrument: FC<TableStructureInstrumentProps> =
  observer(({ store, isTableCell }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const anchorRef = useRef<HTMLSpanElement>(null);
    const table = (store.selectedElements as unknown as AnyElement[])[0];

    const distributeOptions = useMemo<DropdownMenuOption[]>(
      () =>
        DISTRIBUTE_OPTIONS.map((option) => ({
          ...option,
          label: t(DISTRIBUTE_LABEL_KEYS[option.value]) as string,
        })),
      [t]
    );

    const handleToggle = useCallback(() => setIsOpen((prev) => !prev), []);
    const handleClose = useCallback(() => setIsOpen(false), []);

    const handleDistributeSelect = useCallback(
      (value: string) => {
        store.history.transaction(() => {
          (store.selectedElements as unknown as AnyElement[]).forEach(
            (el: AnyElement) => {
              if (value === "rows") {
                el.distributeRowsEvenly?.();
              } else if (value === "columns") {
                el.distributeColumnsEvenly?.();
              }
            }
          );
        });
      },
      [store]
    );

    const getFocusedPosition = useCallback(() => {
      const focusedCells: AnyElement[] = table?.focusedCells ?? [];

      return {
        row: focusedCells.length > 0 ? focusedCells[0].row : 0,
        col: focusedCells.length > 0 ? focusedCells[0].col : 0,
      };
    }, [table]);

    const handleInsertRowAbove = useCallback(() => {
      const { row } = getFocusedPosition();
      store.history.transaction(() => {
        table?.addRow?.(row);
      });
      handleClose();
    }, [store, table, getFocusedPosition, handleClose]);

    const handleInsertRowBelow = useCallback(() => {
      const { row } = getFocusedPosition();
      store.history.transaction(() => {
        table?.addRow?.(row + 1);
      });
      handleClose();
    }, [store, table, getFocusedPosition, handleClose]);

    const handleDeleteRow = useCallback(() => {
      const { row } = getFocusedPosition();
      store.history.transaction(() => {
        table?.removeRow?.(row);
      });
      handleClose();
    }, [store, table, getFocusedPosition, handleClose]);

    const handleInsertColumnLeft = useCallback(() => {
      const { col } = getFocusedPosition();
      store.history.transaction(() => {
        table?.addColumn?.(col);
      });
      handleClose();
    }, [store, table, getFocusedPosition, handleClose]);

    const handleInsertColumnRight = useCallback(() => {
      const { col } = getFocusedPosition();
      store.history.transaction(() => {
        table?.addColumn?.(col + 1);
      });
      handleClose();
    }, [store, table, getFocusedPosition, handleClose]);

    const handleDeleteColumn = useCallback(() => {
      const { col } = getFocusedPosition();
      store.history.transaction(() => {
        table?.removeColumn?.(col);
      });
      handleClose();
    }, [store, table, getFocusedPosition, handleClose]);

    const handleDistributeRows = useCallback(() => {
      store.history.transaction(() => {
        table?.distributeRowsEvenly?.();
      });
      handleClose();
    }, [store, table, handleClose]);

    const handleDistributeColumns = useCallback(() => {
      store.history.transaction(() => {
        table?.distributeColumnsEvenly?.();
      });
      handleClose();
    }, [store, table, handleClose]);

    if (!isTableCell) {
      return (
        <>
          <span ref={anchorRef} className="inline-flex">
            <Tooltip
              content={t("templatesEditor.toolbar.table_structure") as string}
            >
              <IconButton
                iconName="border_all"
                onClick={handleToggle}
                active={isOpen}
              />
            </Tooltip>
          </span>
          <DropdownMenu
            options={distributeOptions}
            isOpen={isOpen}
            onSelect={handleDistributeSelect}
            onClose={handleClose}
            anchorRef={anchorRef}
            size="large"
            placement="bottom"
          />
        </>
      );
    }

    const totalRows = table?.rows ?? 1;
    const totalCols = table?.cols ?? 1;

    return (
      <>
        <span ref={anchorRef} className="inline-flex">
          <Tooltip
            content={t("templatesEditor.toolbar.table_structure") as string}
          >
            <IconButton
              iconName="border_all"
              onClick={handleToggle}
              active={isOpen}
            />
          </Tooltip>
        </span>
        <ToolbarPopover
          isOpen={isOpen}
          onClose={handleClose}
          anchorRef={anchorRef}
        >
          <div className="flex flex-col gap-4 p-[6px]">
            <div className="flex flex-col gap-1">
              <PopoverLabel>{t("templatesEditor.toolbar.rows")}</PopoverLabel>
              <div className="flex flex-col gap-1">
                <OptionItem
                  iconName="keyboard_arrow_up"
                  label={t("templatesEditor.toolbar.insert_above") as string}
                  onClick={handleInsertRowAbove}
                />
                <OptionItem
                  iconName="keyboard_arrow_down"
                  label={t("templatesEditor.toolbar.insert_below") as string}
                  onClick={handleInsertRowBelow}
                />
                <OptionItem
                  iconName="remove"
                  label={t("templatesEditor.toolbar.delete_row") as string}
                  disabled={totalRows <= 1}
                  onClick={handleDeleteRow}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <PopoverLabel>
                {t("templatesEditor.toolbar.columns")}
              </PopoverLabel>
              <div className="flex flex-col gap-1">
                <OptionItem
                  iconName="keyboard_arrow_left"
                  label={t("templatesEditor.toolbar.insert_left") as string}
                  onClick={handleInsertColumnLeft}
                />
                <OptionItem
                  iconName="keyboard_arrow_right"
                  label={t("templatesEditor.toolbar.insert_right") as string}
                  onClick={handleInsertColumnRight}
                />
                <OptionItem
                  iconName="remove"
                  label={t("templatesEditor.toolbar.delete_column") as string}
                  disabled={totalCols <= 1}
                  onClick={handleDeleteColumn}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <PopoverLabel>
                {t("templatesEditor.toolbar.distribute")}
              </PopoverLabel>
              <div className="flex flex-col gap-1">
                <OptionItem
                  iconName="border_horizontal"
                  label={t("templatesEditor.toolbar.rows_evenly") as string}
                  onClick={handleDistributeRows}
                />
                <OptionItem
                  iconName="border_vertical"
                  label={t("templatesEditor.toolbar.columns_evenly") as string}
                  onClick={handleDistributeColumns}
                />
              </div>
            </div>
          </div>
        </ToolbarPopover>
      </>
    );
  });
