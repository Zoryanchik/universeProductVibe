import { observer } from "mobx-react-lite";
import { useCallback, type FC } from "react";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { Checkbox } from "../../../../../ui/Checkbox";
import { Slider } from "../../../../../ui/Slider";
import AdvancedColors from "../../../../../components/AdvancedColors";
import {
  extractAlphaPercent,
  applyAlphaToColor,
  extractOpaqueColor,
} from "../../../../../helpers/colors";

interface ShadowEffectProps {
  store: StoreType;
}

export const ShadowEffect: FC<ShadowEffectProps> = observer(({ store }) => {
  const { t } = useTranslation();
  const element = store.selectedElements[0];
  const shadowEnabled = !!element?.shadowEnabled;

  const rawShadowColor = applyAlphaToColor(
    element?.shadowColor ?? "#000000",
    Math.round((element?.shadowOpacity ?? 1) * 100)
  );
  const opaqueShadowColor = extractOpaqueColor(rawShadowColor);

  const handleShadowBlurChange = useCallback(
    (value: number) => {
      element?.set({ shadowBlur: value });
    },
    [element]
  );

  const handleShadowOffsetXChange = useCallback(
    (value: number) => {
      element?.set({ shadowOffsetX: value });
    },
    [element]
  );

  const handleShadowOffsetYChange = useCallback(
    (value: number) => {
      element?.set({ shadowOffsetY: value });
    },
    [element]
  );

  const handleShadowColorSelect = useCallback(
    (color: string, isCustom?: boolean) => {
      if (!element) return;

      if (isCustom) {
        const alpha = extractAlphaPercent(color);
        const opaque = extractOpaqueColor(color);
        element.set({ shadowColor: opaque, shadowOpacity: alpha / 100 });
      } else {
        const currentOpacity = element.shadowOpacity ?? 1;
        const withAlpha = applyAlphaToColor(
          color,
          Math.round(currentOpacity * 100)
        );
        const opaque = extractOpaqueColor(withAlpha);
        element.set({ shadowColor: opaque, shadowOpacity: currentOpacity });
      }
    },
    [element]
  );

  const handleShadowChange = useCallback(
    (checked: boolean) => {
      element?.set({
        shadowEnabled: checked,
        shadowBlur: checked ? element.shadowBlur || 10 : element.shadowBlur,
        shadowColor: element.shadowColor || "#000000",
      });
    },
    [element]
  );

  const handleShadowOpacityChange = useCallback(
    (value: number) => {
      element?.set({ shadowOpacity: value / 100 });
    },
    [element]
  );

  return (
    <div className="flex w-full flex-col gap-1">
      <Checkbox
        checked={shadowEnabled}
        onChange={handleShadowChange}
        label={t("templatesEditor.side_panel.controls.shadow") as string}
      />
      {shadowEnabled && (
        <div className="box-border flex w-full flex-col gap-1 ps-[10px]">
          <Slider
            label={t("templatesEditor.side_panel.controls.blur") as string}
            value={element.shadowBlur ?? 10}
            min={0}
            max={50}
            onChange={handleShadowBlurChange}
          />
          <Slider
            label={t("templatesEditor.side_panel.controls.offset_x") as string}
            value={element.shadowOffsetX ?? 0}
            min={-50}
            max={50}
            onChange={handleShadowOffsetXChange}
          />
          <Slider
            label={t("templatesEditor.side_panel.controls.offset_y") as string}
            value={element.shadowOffsetY ?? 0}
            min={-50}
            max={50}
            onChange={handleShadowOffsetYChange}
          />
          <Slider
            label={t("templatesEditor.toolbar.opacity") as string}
            value={Math.round((element.shadowOpacity ?? 1) * 100)}
            min={0}
            max={100}
            suffix="%"
            onChange={handleShadowOpacityChange}
          />
          <AdvancedColors
            store={store}
            mode="plain"
            onSelectColor={handleShadowColorSelect}
            pickerInitialValue={rawShadowColor}
            activeColor={opaqueShadowColor}
          />
        </div>
      )}
    </div>
  );
});
