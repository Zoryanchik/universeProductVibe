import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";
import { useCallback, useState, type FC } from "react";

import { useTranslation } from "@/shared/lib/translations";

import { SidePanelSectionLabel } from "../../../../../ui/SidePanelSectionLabel";
import {
  ImageVariant,
  type ImageFilterVariant,
} from "../../../../../components/ImageVariant";
import { CustomScrollArea } from "../../../../../ui/CustomScrollArea";
import { useTemplatesEditorStore } from "../../../../../model/store/templates-editor-store";
import { ShadowEffect } from "../../common/effects/Shadow";
import { BorderEffect } from "../../common/effects/Border";
import { CornerRadiusEffect } from "../../common/effects/CornerRadius";
import { ImageFiltersEffect } from "../../common/effects/ImageFilters";
import { useEffectsTabSwitch } from "../../common/effects/useEffectsTabSwitch";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

const VARIANTS: ImageFilterVariant[] = [
  "cold",
  "warm",
  "sepia",
  "grayscale",
  "natural",
];

const FILTER_VARIANT_KEYS: ImageFilterVariant[] = ["cold", "warm", "natural"];
const BOOL_VARIANT_KEYS: Array<"sepia" | "grayscale"> = ["sepia", "grayscale"];

const clearVariantEffects = (element: AnyElement) => {
  FILTER_VARIANT_KEYS.forEach((key) => {
    element.setFilter(key, 0);
  });
  element.set({ sepiaEnabled: false, grayscaleEnabled: false });
};

const applyVariant = (element: AnyElement, variant: ImageFilterVariant) => {
  if (BOOL_VARIANT_KEYS.includes(variant as "sepia" | "grayscale")) {
    element.set({
      sepiaEnabled: variant === "sepia",
      grayscaleEnabled: variant === "grayscale",
    });
  } else if (variant !== "natural") {
    element.setFilter(variant, 1);
  }
};

interface PhotoEffectsPanelProps {
  store: StoreType;
}

const IMAGE_TYPES = ["image", "svg"];

export const PhotoEffectsPanel: FC<PhotoEffectsPanelProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const setEffectsMode = useTemplatesEditorStore.use.setEffectsMode();
    const elements = store.selectedElements as unknown as AnyElement[];
    const isSvgSelection =
      elements.length > 0 && elements.every((el) => el.type === "svg");
    const element: AnyElement | null =
      elements.length === 1 && IMAGE_TYPES.includes(elements[0]?.type)
        ? elements[0]
        : null;

    const imageSrc: string = element?.src ?? "";
    const [selectedVariant, setSelectedVariant] =
      useState<ImageFilterVariant | null>(
        () => element?.custom?.imageVariant ?? null
      );

    useEffectsTabSwitch(store, IMAGE_TYPES);

    const handleClose = useCallback(() => {
      setEffectsMode(false);
    }, [setEffectsMode]);

    const handleVariantClick = useCallback(
      (variant: ImageFilterVariant) => {
        if (!element) return;

        const isDeselecting = selectedVariant === variant;
        const nextVariant = isDeselecting ? null : variant;

        setSelectedVariant(nextVariant);
        clearVariantEffects(element);

        if (nextVariant) {
          applyVariant(element, nextVariant);
        }

        element.set({
          custom: { ...(element.custom ?? {}), imageVariant: nextVariant },
        });
      },
      [element, selectedVariant]
    );

    return (
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-e-[24px]">
        <div className="box-border flex w-full flex-shrink-0 items-center justify-between px-5 pt-5">
          <SidePanelSectionLabel
            label={
              (isSvgSelection
                ? t("templatesEditor.side_panel.headers.effects_for_icons")
                : t(
                    "templatesEditor.side_panel.headers.effects_for_photos"
                  )) as string
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
              {imageSrc && (
                <div className="box-border grid w-full grid-cols-3 gap-1 px-[10px]">
                  {VARIANTS.map((variant) => (
                    <ImageVariant
                      key={variant}
                      src={imageSrc}
                      variant={variant}
                      selected={selectedVariant === variant}
                      onClick={() => handleVariantClick(variant)}
                    />
                  ))}
                </div>
              )}

              <ImageFiltersEffect store={store} />
              <BorderEffect store={store} hideStrokeType />
              <CornerRadiusEffect store={store} />
              <ShadowEffect store={store} />
            </div>
          </div>
        </CustomScrollArea>
      </div>
    );
  }
);
