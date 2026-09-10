import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";
import { useCallback, useMemo, type FC } from "react";

import { useTranslation } from "@/shared/lib/translations";

import { Tooltip } from "../../../../../ui/Tooltip";
import { ToolbarSelect } from "../../../../../ui/ToolbarSelect";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

interface FontSizeInstrumentProps {
  store: StoreType;
  elements?: AnyElement[];
  editable?: boolean;
  width?: number;
  placement?: "top" | "bottom";
}

const FONT_SIZES = [
  8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 128,
];

const MIXED_SIZE_LABEL = "\u2014";

const getTextElements = (elements: AnyElement[]): AnyElement[] =>
  elements.filter((el: AnyElement) => el.type === "text");

const getFontSizeLabel = (textElements: AnyElement[]): string => {
  if (textElements.length === 0) return "";

  const sizes = new Set(
    textElements.map((el: AnyElement) => el.fontSize as number)
  );
  if (sizes.size > 1) return MIXED_SIZE_LABEL;

  return String([...sizes][0]);
};

export const FontSizeInstrument: FC<FontSizeInstrumentProps> = observer(
  ({
    store,
    elements: elementsProp,
    editable = true,
    width = 100,
    placement,
  }) => {
    const { t } = useTranslation();
    const storeElements = store.selectedElements;
    const textElements =
      elementsProp ?? getTextElements(storeElements as unknown as AnyElement[]);

    const fontSizeLabel = getFontSizeLabel(textElements);

    const fontSizeOptions = useMemo(
      () =>
        FONT_SIZES.map((size) => ({
          label: String(size),
          value: String(size),
        })),
      []
    );

    const numericFilter = useCallback(
      (value: string) => value === "" || /^\d*\.?\d*$/.test(value),
      []
    );

    const handleFontSizeSelect = useCallback(
      (value: string) => {
        const size = Number(value);
        if (!Number.isFinite(size) || size <= 0) return;

        textElements.forEach((el: AnyElement) => el.set({ fontSize: size }));
      },
      [textElements]
    );

    return (
      <Tooltip content={t("templatesEditor.toolbar.font_size") as string}>
        <ToolbarSelect
          value={fontSizeLabel}
          options={fontSizeOptions}
          onSelect={handleFontSizeSelect}
          width={width}
          maxItems={8}
          minWidth={120}
          editable={editable}
          inputFilter={numericFilter}
          placement={placement}
        />
      </Tooltip>
    );
  }
);
