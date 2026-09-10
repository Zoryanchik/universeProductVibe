import { useState, useRef, useCallback, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../../../../../ui/IconButton";
import { Tooltip } from "../../../../../ui/Tooltip";
import { ToolbarPopover } from "../../../../../ui/ToolbarPopover";
import { Slider } from "../../../../../ui/Slider";
import { OptionItem } from "../../../../../components/OptionItem";
import AdvancedColors from "../../../../../components/AdvancedColors";
import {
  extractAlphaPercent,
  applyAlphaToColor,
  extractOpaqueColor,
} from "../../../../../helpers/colors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

type BorderSide = "top" | "right" | "bottom" | "left";
type BorderStyle = "solid" | "dashed" | "dotted" | "none";
type SideSelection = "none" | "top" | "bottom" | "left" | "right" | "all";

const ALL_SIDES: BorderSide[] = ["top", "right", "bottom", "left"];

const getCellsForSides = (
  table: AnyElement,
  sides: Set<BorderSide>
): { cellIds: string[]; sides: BorderSide[] }[] => {
  const sideArr = [...sides];
  const cells: AnyElement[] = table.cells ?? [];

  if (sideArr.length === 4) {
    return [{ cellIds: cells.map((c: AnyElement) => c.id), sides: sideArr }];
  }

  const result: { cellIds: string[]; sides: BorderSide[] }[] = [];
  for (const side of sideArr) {
    let filtered: AnyElement[];
    if (side === "top") filtered = cells.filter((c: AnyElement) => c.row === 0);
    else if (side === "bottom")
      filtered = cells.filter((c: AnyElement) => c.row === table.rows - 1);
    else if (side === "left")
      filtered = cells.filter((c: AnyElement) => c.col === 0);
    else filtered = cells.filter((c: AnyElement) => c.col === table.cols - 1);

    result.push({
      cellIds: filtered.map((c: AnyElement) => c.id),
      sides: [side],
    });
  }

  return result;
};

interface TableBorderInstrumentProps {
  store: StoreType;
}

export const TableBorderInstrument: FC<TableBorderInstrumentProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedSides, setSelectedSides] = useState<Set<BorderSide>>(
      new Set(ALL_SIDES)
    );
    const anchorRef = useRef<HTMLSpanElement>(null);
    const elements = store.selectedElements as unknown as AnyElement[];

    const table: AnyElement | undefined = elements[0];

    const readSide: BorderSide = [...selectedSides][0] ?? "top";
    const readCell: AnyElement | undefined = (() => {
      if (!table) return undefined;

      if (readSide === "bottom") return table.getCell?.(table.rows - 1, 0);

      if (readSide === "right") return table.getCell?.(0, table.cols - 1);

      return table.getCell?.(0, 0);
    })();

    const effectiveBorder = readCell?.getEffectiveBorder
      ? readCell.getEffectiveBorder(readSide)
      : {
          color: table?.borderColor ?? "#000000",
          width: table?.borderWidth ?? 0,
          style: table?.borderStyle ?? "solid",
        };

    const currentStyle = (effectiveBorder.style ?? "solid") as BorderStyle;
    const currentWidth = effectiveBorder.width ?? 0;
    const rawColor = effectiveBorder.color ?? "#000000";
    const currentOpacity = extractAlphaPercent(rawColor);
    const opaqueColor = extractOpaqueColor(rawColor);

    const sideSelection: SideSelection = (() => {
      if (currentStyle === "none" || currentWidth === 0) return "none";

      if (selectedSides.size === 4) return "all";

      if (selectedSides.size === 1) {
        const s = [...selectedSides][0];

        return s as SideSelection;
      }

      return "all";
    })();

    const handleToggle = useCallback(() => setIsOpen((prev) => !prev), []);
    const handleClose = useCallback(() => setIsOpen(false), []);

    const applyBorderChange = useCallback(
      (attrs: {
        borderColor?: string;
        borderWidth?: number;
        borderStyle?: string;
      }) => {
        store.history.transaction(() => {
          const cellAttrs: Record<string, unknown> = {};
          if (attrs.borderColor !== undefined)
            cellAttrs.color = attrs.borderColor;

          if (attrs.borderWidth !== undefined)
            cellAttrs.width = attrs.borderWidth;

          if (attrs.borderStyle !== undefined)
            cellAttrs.style = attrs.borderStyle;

          elements.forEach((el: AnyElement) => {
            for (const { cellIds, sides } of getCellsForSides(
              el,
              selectedSides
            )) {
              el.setCellBorders(cellIds, sides, cellAttrs);
            }

            if (selectedSides.size === 4) {
              el.set(attrs);
            }
          });
        });
      },
      [store, elements, selectedSides]
    );

    const handleSideChange = useCallback(
      (side: SideSelection) => {
        if (side === "none") {
          applyBorderChange({ borderStyle: "none" });
          setSelectedSides(new Set(ALL_SIDES));

          return;
        }

        if (side === "all") {
          setSelectedSides(new Set(ALL_SIDES));
        } else {
          setSelectedSides(new Set([side as BorderSide]));
        }
      },
      [applyBorderChange]
    );

    const handleStyleChange = useCallback(
      (style: BorderStyle) => {
        const width = currentWidth === 0 ? 2 : undefined;
        applyBorderChange({
          borderStyle: style,
          ...(width !== undefined && { borderWidth: width }),
        });
      },
      [applyBorderChange, currentWidth]
    );

    const handleWidthChange = useCallback(
      (value: number) => {
        applyBorderChange({ borderWidth: value });
      },
      [applyBorderChange]
    );

    const handleOpacityChange = useCallback(
      (value: number) => {
        const newColor = applyAlphaToColor(rawColor, value);
        applyBorderChange({ borderColor: newColor });
      },
      [applyBorderChange, rawColor]
    );

    const handleColorSelect = useCallback(
      (color: string, isCustom?: boolean) => {
        let newColor: string;
        if (isCustom) {
          newColor = color;
        } else {
          const alpha = extractAlphaPercent(rawColor);
          newColor = applyAlphaToColor(color, alpha);
        }

        const width = currentWidth === 0 ? 2 : undefined;
        applyBorderChange({
          borderColor: newColor,
          ...(width !== undefined && { borderWidth: width }),
        });
      },
      [applyBorderChange, rawColor, currentWidth]
    );

    const showControls = currentStyle !== "none";

    return (
      <>
        <span ref={anchorRef} className="inline-flex">
          <Tooltip content={t("templatesEditor.toolbar.border") as string}>
            <IconButton
              iconName="border_style"
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
          <div className="flex w-[312px] flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="m-0 font-['Outfit',sans-serif] text-[18px] leading-[20px] font-semibold text-[var(--color-text-primary)]">
                {t("templatesEditor.toolbar.border_sides")}
              </p>
              <div className="flex justify-between">
                <div className="flex flex-col gap-2">
                  <OptionItem
                    iconName="block"
                    label={t("templatesEditor.toolbar.none") as string}
                    active={sideSelection === "none"}
                    onClick={() => handleSideChange("none")}
                  />
                  <OptionItem
                    iconName="border_top"
                    label={t("templatesEditor.toolbar.top") as string}
                    active={sideSelection === "top"}
                    onClick={() => handleSideChange("top")}
                  />
                  <OptionItem
                    iconName="border_bottom"
                    label={t("templatesEditor.toolbar.bottom") as string}
                    active={sideSelection === "bottom"}
                    onClick={() => handleSideChange("bottom")}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <OptionItem
                    iconName="border_left"
                    label={t("templatesEditor.toolbar.left") as string}
                    active={sideSelection === "left"}
                    onClick={() => handleSideChange("left")}
                  />
                  <OptionItem
                    iconName="border_right"
                    label={t("templatesEditor.toolbar.right") as string}
                    active={sideSelection === "right"}
                    onClick={() => handleSideChange("right")}
                  />
                  <OptionItem
                    iconName="border_outer"
                    label={t("templatesEditor.toolbar.all_sides") as string}
                    active={sideSelection === "all"}
                    onClick={() => handleSideChange("all")}
                  />
                </div>
              </div>
            </div>

            {showControls && (
              <>
                <div className="flex flex-col gap-1">
                  <p className="m-0 font-['Outfit',sans-serif] text-[18px] leading-[20px] font-semibold text-[var(--color-text-primary)]">
                    {t("templatesEditor.toolbar.border_style")}
                  </p>
                  <div className="flex justify-between">
                    <div className="flex flex-col gap-1">
                      <OptionItem
                        iconName="horizontal_rule"
                        label={t("templatesEditor.toolbar.solid") as string}
                        active={currentStyle === "solid"}
                        onClick={() => handleStyleChange("solid")}
                      />
                      <OptionItem
                        iconName="pen_size_1"
                        label={t("templatesEditor.toolbar.dashed") as string}
                        active={currentStyle === "dashed"}
                        onClick={() => handleStyleChange("dashed")}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <OptionItem
                        iconName="more_horiz"
                        label={t("templatesEditor.toolbar.dotted") as string}
                        active={currentStyle === "dotted"}
                        onClick={() => handleStyleChange("dotted")}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <Slider
                    label={t("templatesEditor.toolbar.border_width") as string}
                    value={currentWidth}
                    min={1}
                    max={20}
                    onChange={handleWidthChange}
                  />
                  <Slider
                    label={t("templatesEditor.toolbar.opacity") as string}
                    value={currentOpacity}
                    min={0}
                    max={100}
                    suffix="%"
                    onChange={handleOpacityChange}
                  />
                  <AdvancedColors
                    store={store}
                    mode="plain"
                    onSelectColor={handleColorSelect}
                    pickerInitialValue={rawColor}
                    activeColor={opaqueColor}
                  />
                </div>
              </>
            )}
          </div>
        </ToolbarPopover>
      </>
    );
  }
);
