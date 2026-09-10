import { useCallback } from "react";
import type { StoreType } from "polotno/model/store";

import {
  extractAlphaPercent,
  applyAlphaToColor,
  extractOpaqueColor,
} from "./colors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

export type StrokeType = "none" | "solid" | "dashed" | "dotted";

export const DASH_MAP: Record<StrokeType, number[]> = {
  none: [],
  solid: [],
  dashed: [4, 2],
  dotted: [1, 1],
};

export const usesImageBorderAPI = (el: AnyElement): boolean => {
  const type = el?.type;

  return type === "image" || type === "svg" || type === "video";
};

export const getBorderColor = (el: AnyElement): string => {
  if (usesImageBorderAPI(el)) return (el.borderColor as string) ?? "#000000";

  return (el.stroke as string) ?? "#000000";
};

export const getBorderWidth = (el: AnyElement): number => {
  if (usesImageBorderAPI(el)) return el.borderSize ?? 0;

  return el.strokeWidth ?? 0;
};

export const getStrokeType = (el: AnyElement): StrokeType => {
  const width = getBorderWidth(el);
  if (width === 0) return "none";

  if (usesImageBorderAPI(el)) return "solid";

  const dash: number[] | undefined = el.dash;
  if (!dash || dash.length === 0) return "solid";

  if (dash[0] >= 2) return "dashed";

  return "dotted";
};

interface UseBorderResult {
  currentType: StrokeType;
  rawColor: string;
  currentStrokeWidth: number;
  currentOpacity: number;
  opaqueColor: string;
  isImage: boolean;
  borderEnabled: boolean;
  handleStrokeTypeChange: (type: StrokeType) => void;
  handleStrokeWidthChange: (value: number) => void;
  handleOpacityChange: (value: number) => void;
  handleColorSelect: (color: string, isCustom?: boolean) => void;
  handleBorderToggle: (checked: boolean) => void;
}

export function useBorder(store: StoreType): UseBorderResult {
  const elements = store.selectedElements as unknown as AnyElement[];
  const firstEl: AnyElement | undefined = elements[0];
  const currentType = firstEl ? getStrokeType(firstEl) : "none";
  const rawColor = firstEl ? getBorderColor(firstEl) : "#000000";
  const currentStrokeWidth = firstEl ? getBorderWidth(firstEl) : 0;
  const currentOpacity = extractAlphaPercent(rawColor);
  const opaqueColor = extractOpaqueColor(rawColor);
  const isImage = !!firstEl && usesImageBorderAPI(firstEl);
  const borderEnabled = currentType !== "none";

  const setElementBorder = useCallback(
    (el: AnyElement, updates: Record<string, unknown>) => {
      if (usesImageBorderAPI(el)) {
        const mapped: Record<string, unknown> = {};
        if ("stroke" in updates) mapped.borderColor = updates.stroke;

        if ("strokeWidth" in updates) mapped.borderSize = updates.strokeWidth;

        el.set(mapped);
      } else {
        el.set(updates);
      }
    },
    []
  );

  const handleStrokeTypeChange = useCallback(
    (type: StrokeType) => {
      elements.forEach((el: AnyElement) => {
        if (type === "none") {
          setElementBorder(el, { strokeWidth: 0 });
        } else {
          const curWidth = getBorderWidth(el);
          const width = curWidth === 0 ? 2 : curWidth;
          const updates: Record<string, unknown> = { strokeWidth: width };
          if (!usesImageBorderAPI(el)) {
            updates.dash = DASH_MAP[type];
          }

          setElementBorder(el, updates);
        }
      });
    },
    [elements, setElementBorder]
  );

  const handleStrokeWidthChange = useCallback(
    (value: number) => {
      elements.forEach((el: AnyElement) =>
        setElementBorder(el, { strokeWidth: value })
      );
    },
    [elements, setElementBorder]
  );

  const handleOpacityChange = useCallback(
    (value: number) => {
      elements.forEach((el: AnyElement) => {
        const color = getBorderColor(el);
        const newColor = applyAlphaToColor(color, value);
        setElementBorder(el, { stroke: newColor });
      });
    },
    [elements, setElementBorder]
  );

  const handleColorSelect = useCallback(
    (color: string, isCustom?: boolean) => {
      elements.forEach((el: AnyElement) => {
        let newColor: string;
        if (isCustom) {
          newColor = color;
        } else {
          const curColor = getBorderColor(el);
          const alpha = extractAlphaPercent(curColor);
          newColor = applyAlphaToColor(color, alpha);
        }

        const updates: Record<string, unknown> = { stroke: newColor };
        if (getBorderWidth(el) === 0) {
          updates.strokeWidth = 2;
        }

        setElementBorder(el, updates);
      });
    },
    [elements, setElementBorder]
  );

  const handleBorderToggle = useCallback(
    (checked: boolean) => {
      elements.forEach((el: AnyElement) => {
        if (checked) {
          const curWidth = getBorderWidth(el);
          const width = curWidth === 0 ? 2 : curWidth;
          setElementBorder(el, { strokeWidth: width });
        } else {
          setElementBorder(el, { strokeWidth: 0 });
        }
      });
    },
    [elements, setElementBorder]
  );

  return {
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
  };
}
