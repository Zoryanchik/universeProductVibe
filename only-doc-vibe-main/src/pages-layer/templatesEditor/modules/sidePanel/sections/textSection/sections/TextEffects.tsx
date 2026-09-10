import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";
import { useCallback, type FC } from "react";

import { useTranslation } from "@/shared/lib/translations";

import { Checkbox } from "../../../../../ui/Checkbox";
import { Slider } from "../../../../../ui/Slider";
import AdvancedColors from "../../../../../components/AdvancedColors";
import { SidePanelSectionLabel } from "../../../../../ui/SidePanelSectionLabel";
import { CustomScrollArea } from "../../../../../ui/CustomScrollArea";
import {
  extractAlphaPercent,
  applyAlphaToColor,
  extractOpaqueColor,
} from "../../../../../helpers/colors";
import { useTemplatesEditorStore } from "../../../../../model/store/templates-editor-store";
import { ShadowEffect } from "../../common/effects/Shadow";
import { useEffectsTabSwitch } from "../../common/effects/useEffectsTabSwitch";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

interface TextEffectsPanelProps {
  store: StoreType;
}

const TEXT_TYPES = ["text"];

export const TextEffectsPanel: FC<TextEffectsPanelProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const setEffectsMode = useTemplatesEditorStore.use.setEffectsMode();
    const elements = store.selectedElements as unknown as AnyElement[];
    const element: AnyElement | null =
      elements.length === 1 && elements[0]?.type === "text"
        ? elements[0]
        : null;

    const blurEnabled = !!element?.blurEnabled;
    const curveEnabled = !!element?.curveEnabled;
    const strokeWidth = element?.strokeWidth ?? 0;
    const strokeColor = element?.stroke ?? "#000000";
    const backgroundEnabled = !!element?.backgroundEnabled;

    const rawBgColor = applyAlphaToColor(
      element?.backgroundColor ?? "#ffffff",
      Math.round((element?.backgroundOpacity ?? 1) * 100)
    );
    const opaqueBgColor = extractOpaqueColor(rawBgColor);

    useEffectsTabSwitch(store, TEXT_TYPES);

    const handleClose = useCallback(() => {
      setEffectsMode(false);
    }, [setEffectsMode]);

    const handleBlurChange = useCallback(
      (checked: boolean) => {
        element?.set({
          blurEnabled: checked,
          blurRadius: checked ? element.blurRadius || 10 : 0,
        });
      },
      [element]
    );

    const handleCurvedTextChange = useCallback(
      (checked: boolean) => {
        element?.set({
          curveEnabled: checked,
          curvePower: checked && !element.curvePower ? 0.5 : element.curvePower,
        });
      },
      [element]
    );

    const handleTextStrokeChange = useCallback(
      (checked: boolean) => {
        element?.set({
          strokeWidth: checked ? element.strokeWidth || 2 : 0,
          stroke: element.stroke || "#000000",
        });
      },
      [element]
    );

    const handleStrokeWidthChange = useCallback(
      (value: number) => {
        element?.set({ strokeWidth: value });
      },
      [element]
    );

    const handleStrokeColorSelect = useCallback(
      (color: string) => {
        element?.set({ stroke: color });
      },
      [element]
    );

    const handleBackgroundChange = useCallback(
      (checked: boolean) => {
        element?.set({
          backgroundEnabled: checked,
          backgroundColor: checked
            ? element.backgroundColor || "#ffffff"
            : element.backgroundColor,
        });
      },
      [element]
    );

    const handleBlurRadiusChange = useCallback(
      (value: number) => {
        element?.set({ blurRadius: value });
      },
      [element]
    );

    const handleCurvePowerChange = useCallback(
      (value: number) => {
        element?.set({ curvePower: value / 100 });
      },
      [element]
    );

    const handleBackgroundColorSelect = useCallback(
      (color: string, isCustom?: boolean) => {
        if (!element) return;

        if (isCustom) {
          const alpha = extractAlphaPercent(color);
          const opaque = extractOpaqueColor(color);
          element.set({
            backgroundColor: opaque,
            backgroundOpacity: alpha / 100,
          });
        } else {
          const currentOpacity = element.backgroundOpacity ?? 1;
          const withAlpha = applyAlphaToColor(
            color,
            Math.round(currentOpacity * 100)
          );
          const opaque = extractOpaqueColor(withAlpha);
          element.set({
            backgroundColor: opaque,
            backgroundOpacity: currentOpacity,
          });
        }
      },
      [element]
    );

    const handleBackgroundOpacityChange = useCallback(
      (value: number) => {
        element?.set({ backgroundOpacity: value / 100 });
      },
      [element]
    );

    const handleBackgroundCornerRadiusChange = useCallback(
      (value: number) => {
        element?.set({ backgroundCornerRadius: value / 100 });
      },
      [element]
    );

    const handleBackgroundPaddingChange = useCallback(
      (value: number) => {
        element?.set({ backgroundPadding: value / 100 });
      },
      [element]
    );

    if (!element) {
      return (
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-e-[24px]">
          <div className="box-border flex w-full flex-shrink-0 items-center justify-between px-5 pt-5">
            <SidePanelSectionLabel
              label={
                t(
                  "templatesEditor.side_panel.headers.effects_for_text"
                ) as string
              }
              type="header"
            />
            <button
              type="button"
              onClick={handleClose}
              className="flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0 text-[var(--color-action-main,black)]"
            >
              <span className="material-symbols-rounded text-2xl">close</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-e-[24px]">
        <div className="box-border flex w-full flex-shrink-0 items-center justify-between px-5 pt-5">
          <SidePanelSectionLabel
            label={
              t("templatesEditor.side_panel.headers.effects_for_text") as string
            }
            type="header"
          />
          <button
            type="button"
            onClick={handleClose}
            className="flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0 text-[var(--color-action-main,black)]"
          >
            <span className="material-symbols-rounded text-2xl">close</span>
          </button>
        </div>

        <CustomScrollArea className="min-h-0 w-full flex-1">
          <div className="flex flex-col">
            <div className="box-border flex w-full flex-col gap-2 p-5">
              <div className="flex w-full flex-col gap-1">
                <Checkbox
                  checked={blurEnabled}
                  onChange={handleBlurChange}
                  label={
                    t("templatesEditor.side_panel.controls.blur") as string
                  }
                />
                {blurEnabled && (
                  <div className="box-border flex w-full flex-col gap-1 ps-[10px]">
                    <Slider
                      label={
                        t(
                          "templatesEditor.side_panel.controls.radius"
                        ) as string
                      }
                      value={element.blurRadius ?? 10}
                      min={0}
                      max={50}
                      onChange={handleBlurRadiusChange}
                    />
                  </div>
                )}
              </div>

              <div className="flex w-full flex-col gap-1">
                <Checkbox
                  checked={curveEnabled}
                  onChange={handleCurvedTextChange}
                  label={
                    t(
                      "templatesEditor.side_panel.controls.curved_text"
                    ) as string
                  }
                />
                {curveEnabled && (
                  <div className="box-border flex w-full flex-col gap-1 ps-[10px]">
                    <Slider
                      label={
                        t("templatesEditor.side_panel.controls.power") as string
                      }
                      value={Math.round((element.curvePower ?? 0.5) * 100)}
                      min={-100}
                      max={100}
                      onChange={handleCurvePowerChange}
                    />
                  </div>
                )}
              </div>

              <div className="flex w-full flex-col gap-1">
                <Checkbox
                  checked={strokeWidth > 0}
                  onChange={handleTextStrokeChange}
                  label={
                    t(
                      "templatesEditor.side_panel.controls.text_stroke"
                    ) as string
                  }
                />
                {strokeWidth > 0 && (
                  <div className="box-border flex w-full flex-col gap-1 ps-[10px]">
                    <Slider
                      label={
                        t(
                          "templatesEditor.side_panel.controls.stroke_width"
                        ) as string
                      }
                      value={strokeWidth}
                      min={1}
                      max={20}
                      onChange={handleStrokeWidthChange}
                    />
                    <AdvancedColors
                      store={store}
                      mode="plain"
                      onSelectColor={handleStrokeColorSelect}
                      pickerInitialValue={strokeColor}
                      activeColor={strokeColor}
                    />
                  </div>
                )}
              </div>

              <div className="flex w-full flex-col gap-1">
                <Checkbox
                  checked={backgroundEnabled}
                  onChange={handleBackgroundChange}
                  label={
                    t(
                      "templatesEditor.side_panel.controls.background"
                    ) as string
                  }
                />
                {backgroundEnabled && (
                  <div className="box-border flex w-full flex-col gap-1 ps-[10px]">
                    <Slider
                      label={t("templatesEditor.toolbar.opacity") as string}
                      value={Math.round((element.backgroundOpacity ?? 1) * 100)}
                      min={0}
                      max={100}
                      suffix="%"
                      onChange={handleBackgroundOpacityChange}
                    />
                    <Slider
                      label={
                        t(
                          "templatesEditor.side_panel.controls.corner_radius"
                        ) as string
                      }
                      value={Math.round(
                        (element.backgroundCornerRadius ?? 0) * 100
                      )}
                      min={0}
                      max={100}
                      onChange={handleBackgroundCornerRadiusChange}
                    />
                    <Slider
                      label={
                        t(
                          "templatesEditor.side_panel.controls.padding"
                        ) as string
                      }
                      value={Math.round((element.backgroundPadding ?? 0) * 100)}
                      min={0}
                      max={100}
                      onChange={handleBackgroundPaddingChange}
                    />
                    <AdvancedColors
                      store={store}
                      mode="plain"
                      onSelectColor={handleBackgroundColorSelect}
                      pickerInitialValue={rawBgColor}
                      activeColor={opaqueBgColor}
                    />
                  </div>
                )}
              </div>

              <ShadowEffect store={store} />
            </div>
          </div>
        </CustomScrollArea>
      </div>
    );
  }
);
