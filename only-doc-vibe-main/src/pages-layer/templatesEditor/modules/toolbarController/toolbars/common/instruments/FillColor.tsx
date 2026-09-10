import { useCallback, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";
import { useSvgColors } from "polotno/utils/svg";

import { useTranslation } from "@/shared/lib/translations";

import { ColorControl } from "../ColorControl";
import { findColorKey, resolveColor } from "../../../../../helpers/colors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

interface FillColorInstrumentProps {
  store: StoreType;
  colorProperty?: string;
  iconName?: string;
  tooltipContent?: string;
  elements?: AnyElement[];
  solidOnly?: boolean;
}

export const FillColorInstrument: FC<FillColorInstrumentProps> = observer(
  ({
    store,
    colorProperty = "fill",
    iconName = "colors",
    tooltipContent,
    elements: elementsProp,
    solidOnly,
  }) => {
    const { t } = useTranslation();
    const tooltip =
      tooltipContent ?? (t("templatesEditor.toolbar.fill_color") as string);
    const elements =
      elementsProp ?? (store.selectedElements as unknown as AnyElement[]);

    const firstEl: AnyElement | undefined = elements[0];
    const isSvg = !!firstEl && firstEl.type === "svg";
    const svgColors = useSvgColors(isSvg ? firstEl.src : "");
    const firstSvgColor = svgColors.length > 0 ? svgColors[0] : null;

    const initialColor = (() => {
      if (!firstEl) return "#000000";

      if (isSvg && firstSvgColor)
        return resolveColor(firstEl.colorsReplace, firstSvgColor);

      return (firstEl[colorProperty] as string) ?? "#000000";
    })();

    const handleColorSelect = useCallback(
      (value: string) => {
        elements.forEach((el: AnyElement) => {
          if (el.type === "svg" && firstSvgColor) {
            const colorKey = findColorKey(el.colorsReplace, firstSvgColor);
            el.replaceColor(colorKey, value);
          } else {
            el.set({ [colorProperty]: value });
          }
        });
      },
      [elements, colorProperty, firstSvgColor]
    );

    return (
      <ColorControl
        initialColor={initialColor}
        onSelect={handleColorSelect}
        iconName={iconName}
        tooltipContent={tooltip}
        solidOnly={solidOnly}
      />
    );
  }
);
