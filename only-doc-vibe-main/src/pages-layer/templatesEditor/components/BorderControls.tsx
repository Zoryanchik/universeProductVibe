import { type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { Checkbox } from "../ui/Checkbox";
import { Slider } from "../ui/Slider";
import { useBorder } from "../helpers/border";
import { OptionItem } from "./OptionItem";
import AdvancedColors from "./AdvancedColors";

interface BorderControlsProps {
  store: StoreType;
  mode: "effect" | "instrument";
  hideStrokeType?: boolean;
}

export const BorderControls: FC<BorderControlsProps> = observer(
  ({ store, mode, hideStrokeType }) => {
    const { t } = useTranslation();
    const {
      currentType,
      rawColor,
      currentStrokeWidth,
      currentOpacity,
      opaqueColor,
      isImage,
      borderEnabled,
      handleStrokeTypeChange,
      handleStrokeWidthChange,
      handleOpacityChange,
      handleColorSelect,
      handleBorderToggle,
    } = useBorder(store);

    const sliders = (
      <>
        <Slider
          label={
            t("templatesEditor.side_panel.controls.stroke_width") as string
          }
          value={currentStrokeWidth}
          min={1}
          max={20}
          onChange={handleStrokeWidthChange}
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
      </>
    );

    return (
      <>
        {!hideStrokeType && (
          <div className="flex flex-col gap-3">
            <p className="m-0 font-[Outfit,sans-serif] text-[18px] leading-5 font-semibold text-[var(--color-text-primary)]">
              {t("templatesEditor.ui.stroke_type") as string}
            </p>
            <div className="flex items-center gap-4">
              <OptionItem
                iconName="block"
                label={t("templatesEditor.toolbar.none") as string}
                active={currentType === "none"}
                onClick={() => handleStrokeTypeChange("none")}
              />
              <OptionItem
                iconName="horizontal_rule"
                label={t("templatesEditor.toolbar.solid") as string}
                active={currentType === "solid"}
                onClick={() => handleStrokeTypeChange("solid")}
              />
            </div>
            {!isImage && (
              <div className="flex items-center gap-4">
                <OptionItem
                  iconName="pen_size_1"
                  label={t("templatesEditor.toolbar.dashed") as string}
                  active={currentType === "dashed"}
                  onClick={() => handleStrokeTypeChange("dashed")}
                />
                <OptionItem
                  iconName="more_horiz"
                  label={t("templatesEditor.toolbar.dotted") as string}
                  active={currentType === "dotted"}
                  onClick={() => handleStrokeTypeChange("dotted")}
                />
              </div>
            )}
          </div>
        )}

        {mode === "effect" ? (
          <div className="flex w-full flex-col gap-1">
            <Checkbox
              checked={borderEnabled}
              onChange={handleBorderToggle}
              label={t("templatesEditor.toolbar.border") as string}
            />
            {borderEnabled && (
              <div className="box-border flex w-full flex-col gap-1 ps-[10px]">
                {sliders}
              </div>
            )}
          </div>
        ) : (
          borderEnabled && <div className="flex flex-col gap-1">{sliders}</div>
        )}
      </>
    );
  }
);
