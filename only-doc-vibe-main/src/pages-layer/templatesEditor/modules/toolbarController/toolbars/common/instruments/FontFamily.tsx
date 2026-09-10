import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";
import { useCallback, useMemo, type FC } from "react";
import { getFontsList, globalFonts } from "polotno/utils/fonts";

import { useTranslation } from "@/shared/lib/translations";

import { Tooltip } from "../../../../../ui/Tooltip";
import { DIVIDER_VALUE } from "../../../../../ui/DropdownMenu";
import { ToolbarSelect } from "../../../../../ui/ToolbarSelect";
import { useTemplatesEditorStore } from "../../../../../model/store/templates-editor-store";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

const getFontFamilyValue = (
  textElements: AnyElement[],
  mixedLabel: string
): string => {
  if (textElements.length === 0) return "";

  const families = new Set(
    textElements.map((el: AnyElement) => el.fontFamily as string)
  );
  if (families.size > 1) return mixedLabel;

  return [...families][0];
};

const getTextElements = (elements: AnyElement[]): AnyElement[] =>
  elements.filter((el: AnyElement) => el.type === "text");

interface FontFamilyInstrumentProps {
  store: StoreType;
  elements?: AnyElement[];
  width?: number;
  placement?: "top" | "bottom";
}

export const FontFamilyInstrument: FC<FontFamilyInstrumentProps> = observer(
  ({ store, elements: elementsProp, width = 180, placement }) => {
    const { t } = useTranslation();
    const uploadedFonts = useTemplatesEditorStore.use.uploadedFonts();
    const googleFonts = useTemplatesEditorStore.use.googleFonts();

    const storeElements = store.selectedElements;
    const textElements =
      elementsProp ?? getTextElements(storeElements as unknown as AnyElement[]);

    const fontFamilyValue = getFontFamilyValue(
      textElements,
      t("templatesEditor.toolbar.mixed") as string
    );

    const fontFamilyOptions = useMemo(() => {
      const fallbackFonts: string[] = getFontsList().slice();
      const storeFontNames = (
        store.fonts as unknown as { fontFamily: string }[]
      ).map((f) => f.fontFamily);
      const globalFontNames = (
        globalFonts as unknown as { fontFamily: string }[]
      ).map((f) => f.fontFamily);
      const uploadedNames = uploadedFonts.map((f) => f.fontFamily);
      const apiFonts = googleFonts.length > 0 ? googleFonts : fallbackFonts;

      const uploadedSet = new Set(uploadedNames);
      const otherFamilies = [
        ...new Set([...storeFontNames, ...globalFontNames, ...apiFonts]),
      ]
        .filter((f) => !uploadedSet.has(f))
        .sort((a, b) => a.localeCompare(b));

      const result = uploadedNames.map((family) => ({
        label: family,
        value: family,
      }));
      if (uploadedNames.length > 0 && otherFamilies.length > 0) {
        result.push({ label: "", value: DIVIDER_VALUE });
      }

      otherFamilies.forEach((family) =>
        result.push({ label: family, value: family })
      );

      return result;
    }, [uploadedFonts, googleFonts, store.fonts]);

    const handleFontFamilySelect = useCallback(
      (value: string) => {
        textElements.forEach((el: AnyElement) => el.set({ fontFamily: value }));
      },
      [textElements]
    );

    return (
      <Tooltip content={t("templatesEditor.toolbar.font_family") as string}>
        <ToolbarSelect
          value={fontFamilyValue}
          options={fontFamilyOptions}
          onSelect={handleFontFamilySelect}
          width={width}
          maxItems={7}
          searchable
          minWidth={270}
          placement={placement}
        />
      </Tooltip>
    );
  }
);
