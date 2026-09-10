import type { StoreType } from "polotno/model/store";
import { pxToUnitRounded, unitToPx, type UnitType } from "polotno/utils/unit";
import { observer } from "mobx-react-lite";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type KeyboardEvent,
  type FC,
} from "react";

import { useTranslation } from "@/shared/lib/translations";

import { Button } from "../../../../../ui/Button";
import { IconButton } from "../../../../../ui/IconButton";
import { NumberInput } from "../../../../../ui/NumberInput";
import { ToolbarSelect } from "../../../../../ui/ToolbarSelect";
import { useApplyCanvasSizeToAllPages } from "../../../../../helpers/applyCanvasSizeToAllPages";

const UNIT_OPTIONS = [
  { label: "px", value: "px" },
  { label: "cm", value: "cm" },
  { label: "in", value: "in" },
];

interface CustomSectionProps {
  store: StoreType;
}

export const CustomSection: FC<CustomSectionProps> = observer(({ store }) => {
  const { t } = useTranslation();
  const { applyCanvasSizeToAllPages } = useApplyCanvasSizeToAllPages({ store });
  const [hasAspectRatio, setHasAspectRatio] = useState(false);

  const computedWidth = store.activePage?.computedWidth || store.width;
  const computedHeight = store.activePage?.computedHeight || store.height;

  const [widthValue, setWidthValue] = useState(() =>
    pxToUnitRounded({ px: computedWidth, unit: store.unit, dpi: store.dpi })
  );
  const [heightValue, setHeightValue] = useState(() =>
    pxToUnitRounded({ px: computedHeight, unit: store.unit, dpi: store.dpi })
  );

  const aspectRatioRef = useRef(computedWidth / computedHeight);

  useEffect(() => {
    const w = pxToUnitRounded({
      px: computedWidth,
      unit: store.unit,
      dpi: store.dpi,
    });
    const h = pxToUnitRounded({
      px: computedHeight,
      unit: store.unit,
      dpi: store.dpi,
    });
    setWidthValue(w);
    setHeightValue(h);
    aspectRatioRef.current = w / h;
  }, [computedWidth, computedHeight, store.unit, store.dpi]);

  const roundForUnit = useCallback(
    (value: number) =>
      store.unit === "px" ? Math.round(value) : Math.round(value * 10) / 10,
    [store.unit]
  );

  const handleWidthChange = useCallback(
    (newWidth: number) => {
      setWidthValue(newWidth);
      if (hasAspectRatio && aspectRatioRef.current > 0) {
        setHeightValue(roundForUnit(newWidth / aspectRatioRef.current));
      }
    },
    [hasAspectRatio, roundForUnit]
  );

  const handleHeightChange = useCallback(
    (newHeight: number) => {
      setHeightValue(newHeight);
      if (hasAspectRatio && aspectRatioRef.current > 0) {
        setWidthValue(roundForUnit(newHeight * aspectRatioRef.current));
      }
    },
    [hasAspectRatio, roundForUnit]
  );

  const toggleAspectRatio = useCallback(() => {
    setHasAspectRatio((prev) => {
      if (!prev) {
        aspectRatioRef.current = widthValue / heightValue;
      }

      return !prev;
    });
  }, [widthValue, heightValue]);

  const applyResize = useCallback(() => {
    const pxWidth = unitToPx({
      unitVal: widthValue,
      dpi: store.dpi,
      unit: store.unit,
    });
    const pxHeight = unitToPx({
      unitVal: heightValue,
      dpi: store.dpi,
      unit: store.unit,
    });

    applyCanvasSizeToAllPages(pxWidth, pxHeight);
  }, [applyCanvasSizeToAllPages, store, widthValue, heightValue]);

  const handleUnitChange = useCallback(
    (value: string) => {
      store.setUnit({ unit: value as UnitType, dpi: store.dpi });
    },
    [store]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        applyResize();
      }
    },
    [applyResize]
  );

  const draftWidthPx = Math.round(
    unitToPx({ unitVal: widthValue, dpi: store.dpi, unit: store.unit })
  );
  const draftHeightPx = Math.round(
    unitToPx({ unitVal: heightValue, dpi: store.dpi, unit: store.unit })
  );
  const hasNewSizeValues =
    draftWidthPx !== Math.round(computedWidth) ||
    draftHeightPx !== Math.round(computedHeight);

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full items-start justify-between gap-2">
        <div className="flex flex-1 items-start gap-3">
          <div className="flex w-[100px] flex-col pb-6">
            <NumberInput
              size="large"
              value={heightValue}
              suffix="H"
              onChange={handleHeightChange}
              onKeyDown={handleKeyDown}
              min={1}
              step={store.unit === "px" ? 1 : 0.1}
            />
          </div>

          <div className="flex w-[100px] flex-col pb-6">
            <NumberInput
              size="large"
              value={widthValue}
              suffix="W"
              onChange={handleWidthChange}
              onKeyDown={handleKeyDown}
              min={1}
              step={store.unit === "px" ? 1 : 0.1}
            />
          </div>
          <IconButton
            iconName="aspect_ratio"
            onClick={toggleAspectRatio}
            active={hasAspectRatio}
            size="large"
          />
        </div>

        <div className="flex-shrink-0">
          <ToolbarSelect
            value={store.unit}
            options={UNIT_OPTIONS}
            onSelect={handleUnitChange}
            width={75}
            height={44}
          />
        </div>
      </div>

      {hasNewSizeValues ? (
        <Button
          variant="outlined"
          colorType="secondary"
          onClick={applyResize}
          minWidth={0}
        >
          {t("templatesEditor.side_panel.custom_size.resize")}
        </Button>
      ) : null}
    </div>
  );
});
