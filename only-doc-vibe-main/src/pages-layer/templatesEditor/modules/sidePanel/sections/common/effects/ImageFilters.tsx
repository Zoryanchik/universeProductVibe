import { observer } from "mobx-react-lite";
import { useCallback, type FC } from "react";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { Checkbox } from "../../../../../ui/Checkbox";
import { Slider } from "../../../../../ui/Slider";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

const INDEPENDENT_FILTER_KEYS = [
  "temperature",
  "contrast",
  "shadows",
  "white",
  "black",
  "vibrance",
  "saturation",
] as const;

const INDEPENDENT_FILTER_LABEL_KEYS: Record<
  (typeof INDEPENDENT_FILTER_KEYS)[number],
  string
> = {
  temperature: "templatesEditor.side_panel.controls.temperature",
  contrast: "templatesEditor.side_panel.controls.contrast",
  shadows: "templatesEditor.side_panel.controls.shadows",
  white: "templatesEditor.side_panel.controls.white",
  black: "templatesEditor.side_panel.controls.black",
  vibrance: "templatesEditor.side_panel.controls.vibrance",
  saturation: "templatesEditor.side_panel.controls.saturation",
};

const intensityToSlider = (intensity: number) =>
  Math.round(intensity * 50 + 50);
const sliderToIntensity = (slider: number) => (slider - 50) / 50;

const brightnessToSlider = (brightness: number) =>
  Math.round(brightness * 100 + 50);
const sliderToBrightness = (slider: number) => (slider - 50) / 100;

interface ImageFiltersEffectProps {
  store: StoreType;
}

export const ImageFiltersEffect: FC<ImageFiltersEffectProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const element = store.selectedElements[0] as AnyElement;

    const handleBlurToggle = useCallback(
      (checked: boolean) => {
        element?.set({
          blurEnabled: checked,
          blurRadius: checked ? element.blurRadius || 10 : element.blurRadius,
        });
      },
      [element]
    );

    const handleBlurChange = useCallback(
      (value: number) => {
        element?.set({ blurRadius: value });
      },
      [element]
    );

    const handleBrightnessToggle = useCallback(
      (checked: boolean) => {
        element?.set({
          brightnessEnabled: checked,
          brightness: checked ? element.brightness || 0 : element.brightness,
        });
      },
      [element]
    );

    const handleBrightnessChange = useCallback(
      (value: number) => {
        element?.set({ brightness: sliderToBrightness(value) });
      },
      [element]
    );

    const handleIndependentFilterToggle = useCallback(
      (key: string) => (checked: boolean) => {
        if (!element) return;

        const customKey = `${key}FilterEnabled`;
        if (checked) {
          element.setFilter(key, 0.5);
        } else {
          element.setFilter(key, 0);
        }

        element.set({
          custom: { ...(element.custom ?? {}), [customKey]: checked },
        });
      },
      [element]
    );

    const handleIndependentFilterChange = useCallback(
      (key: string) => (value: number) => {
        element?.setFilter(key, sliderToIntensity(value));
      },
      [element]
    );

    const blurEnabled = !!element?.blurEnabled;
    const brightnessEnabled = !!element?.brightnessEnabled;

    return (
      <>
        <div className="flex w-full flex-col gap-1">
          <Checkbox
            checked={blurEnabled}
            onChange={handleBlurToggle}
            label={t("templatesEditor.side_panel.controls.blur") as string}
          />
          {blurEnabled && (
            <div className="box-border flex w-full flex-col gap-1 ps-[10px]">
              <Slider
                value={element?.blurRadius ?? 10}
                min={0}
                max={100}
                onChange={handleBlurChange}
              />
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-1">
          <Checkbox
            checked={brightnessEnabled}
            onChange={handleBrightnessToggle}
            label={
              t("templatesEditor.side_panel.controls.brightness") as string
            }
          />
          {brightnessEnabled && (
            <div className="box-border flex w-full flex-col gap-1 ps-[10px]">
              <Slider
                value={brightnessToSlider(element?.brightness ?? 0)}
                min={0}
                max={100}
                onChange={handleBrightnessChange}
              />
            </div>
          )}
        </div>

        {INDEPENDENT_FILTER_KEYS.map((key) => {
          const enabled = !!element?.custom?.[`${key}FilterEnabled`];
          const intensity = element?.filters?.get(key)?.intensity ?? 0;

          return (
            <div key={key} className="flex w-full flex-col gap-1">
              <Checkbox
                checked={enabled}
                onChange={handleIndependentFilterToggle(key)}
                label={t(INDEPENDENT_FILTER_LABEL_KEYS[key]) as string}
              />
              {enabled && (
                <div className="box-border flex w-full flex-col gap-1 ps-[10px]">
                  <Slider
                    value={intensityToSlider(intensity)}
                    min={0}
                    max={100}
                    onChange={handleIndependentFilterChange(key)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  }
);
