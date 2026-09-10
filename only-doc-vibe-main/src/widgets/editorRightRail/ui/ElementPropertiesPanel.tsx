import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, cn } from "@universe-forma/ui-pes";

import { useTranslation } from "@/shared/lib/translations/useTranslation";

import { buildFabricShadow, useEditorActions } from "@/features/editor";
import type {
  EditorElementShadow,
  EditorSelectedElement,
  EditorStrokeLineJoin,
} from "@/features/editor";

import { toColorInputValue } from "../lib/color-utils";
import { BarCodeElementPropertiesPanel } from "./BarCodeElementPropertiesPanel";
import { QRCodeElementPropertiesPanel } from "./QRCodeElementPropertiesPanel";
import { TextElementPropertiesPanel } from "./TextElementPropertiesPanel";

const iconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

interface ElementPropertiesPanelProps {
  readonly element: EditorSelectedElement;
}

export const ElementPropertiesPanel: React.FC<ElementPropertiesPanelProps> = ({
  element,
}) => {
  const { t } = useTranslation();
  const actions = useEditorActions();
  const strokeJoins = useMemo(
    () => [
      {
        id: "miter" as const,
        label: String(t("editor_page.element_properties.stroke_join_miter")),
      },
      {
        id: "round" as const,
        label: String(t("editor_page.element_properties.stroke_join_round")),
      },
      {
        id: "bevel" as const,
        label: String(t("editor_page.element_properties.stroke_join_bevel")),
      },
    ],
    [t]
  );
  const [openSections, setOpenSections] = useState({
    rotation: true,
    fill: true,
    stroke: true,
    shadow: true,
  });

  const showRotation = element.supportsRotation;

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const buildShadow = (patch: Partial<EditorElementShadow>) =>
    buildFabricShadow({ ...element.shadow, ...patch });

  const previewShadow = (patch: Partial<EditorElementShadow>) => {
    actions.updateSelectedPreview({ shadow: buildShadow(patch) });
  };

  const commitShadow = (patch: Partial<EditorElementShadow>) => {
    actions.updateSelected({ shadow: buildShadow(patch) });
  };

  const setShadowEnabled = (enabled: boolean) => {
    actions.updateSelected({
      shadow: enabled ? buildFabricShadow(element.shadow) : null,
    });
  };

  const setStrokeEnabled = (enabled: boolean) => {
    if (enabled) {
      actions.updateSelected({
        stroke:
          element.stroke && element.stroke !== "transparent"
            ? element.stroke
            : "#000000",
        strokeWidth: element.strokeWidth > 0 ? element.strokeWidth : 1,
      });

      return;
    }

    actions.updateSelected({ strokeWidth: 0 });
  };

  const showFill = !element.isImage && !element.isBarCode && !element.isQRCode;

  if (element.isText) {
    return (
      <div className="space-y-3">
        <TextElementPropertiesPanel element={element} />
        <ArrangeSection element={element} />
      </div>
    );
  }

  if (element.isQRCode && element.qrCode) {
    return (
      <div className="space-y-3">
        <QRCodeElementPropertiesPanel element={element} />
        <ArrangeSection element={element} />
      </div>
    );
  }

  if (element.isBarCode && element.barCode) {
    return (
      <div className="space-y-3">
        <BarCodeElementPropertiesPanel element={element} />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {showRotation && (
        <PropertySection
          title={String(t("editor_page.element_properties.rotation"))}
          icon={
            <svg {...iconProps}>
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <polyline points="21 3 21 9 15 9" />
            </svg>
          }
          open={openSections.rotation}
          onToggle={() => toggleSection("rotation")}
        >
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outlined"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                actions.updateSelected({ angle: element.rotation - 45 })
              }
            >
              <svg {...iconProps} className="shrink-0">
                <path d="M3 12a9 9 0 1 0 9-9" />
                <polyline points="3 3 3 9 9 9" />
              </svg>
              -45°
            </Button>
            <Button
              type="button"
              variant="outlined"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                actions.updateSelected({ angle: element.rotation + 45 })
              }
            >
              <svg {...iconProps} className="shrink-0">
                <path d="M21 12a9 9 0 1 1-3-6.7" />
                <polyline points="21 3 21 9 15 9" />
              </svg>
              +45°
            </Button>
          </div>
        </PropertySection>
      )}

      {showFill && (
        <PropertySection
          title={String(t("editor_page.element_properties.fill"))}
          open={openSections.fill}
          onToggle={() => toggleSection("fill")}
        >
          <div className="flex items-center gap-2">
            <select
              value="solid"
              disabled
              className="h-9 min-w-0 flex-1 rounded-lg border border-white/10 bg-[#2A2D33] px-2 text-sm text-white/80"
            >
              <option value="solid">Solid Color</option>
            </select>
            <ColorSwatch
              value={element.fill}
              onPreview={(fill) => actions.updateSelectedPreview({ fill })}
              onCommit={(fill) => actions.updateSelected({ fill })}
            />
          </div>
        </PropertySection>
      )}

      <div className="border-t border-white/5 py-3">
        <span className="mb-2 block text-xs font-medium text-white/70">
          Flip
        </span>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outlined"
            size="sm"
            className="gap-1.5"
            onClick={() => actions.updateSelected({ flipY: !element.flipY })}
          >
            <svg {...iconProps} className="shrink-0">
              <path d="M12 3v18" />
              <path d="M8 7h8" />
              <path d="M8 17h8" />
            </svg>
            Vertical
          </Button>
          <Button
            type="button"
            variant="outlined"
            size="sm"
            className="gap-1.5"
            onClick={() => actions.updateSelected({ flipX: !element.flipX })}
          >
            <svg {...iconProps} className="shrink-0">
              <path d="M3 12h18" />
              <path d="M7 8v8" />
              <path d="M17 8v8" />
            </svg>
            Horizontal
          </Button>
        </div>
      </div>

      <PropertySection
        title={String(t("editor_page.element_properties.stroke"))}
        open={openSections.stroke}
        onToggle={() => toggleSection("stroke")}
        trailing={
          <ToggleSwitch
            checked={element.strokeEnabled}
            onChange={setStrokeEnabled}
            label={String(t("editor_page.element_properties.stroke"))}
          />
        }
      >
        {element.strokeEnabled && (
          <div className="space-y-3">
            <SliderRow
              label={String(t("editor_page.element_properties.stroke_width"))}
              value={element.strokeWidth}
              min={0}
              max={20}
              step={0.5}
              onPreview={(strokeWidth) =>
                actions.updateSelectedPreview({ strokeWidth })
              }
              onCommit={(strokeWidth) =>
                actions.updateSelected({ strokeWidth })
              }
            />
            <label className="block space-y-1.5">
              <span className="text-xs text-white/60">Corner style</span>
              <select
                value={element.strokeLineJoin}
                onChange={(event) =>
                  actions.updateSelected({
                    strokeLineJoin: event.target.value as EditorStrokeLineJoin,
                  })
                }
                className="h-9 w-full rounded-lg border border-white/10 bg-[#2A2D33] px-3 text-sm text-white"
              >
                {strokeJoins.map((join) => (
                  <option key={join.id} value={join.id}>
                    {join.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center justify-between gap-3">
              <span className="text-xs text-white/60">Stroke color</span>
              <ColorSwatch
                value={element.stroke}
                onPreview={(stroke) =>
                  actions.updateSelectedPreview({ stroke })
                }
                onCommit={(stroke) => actions.updateSelected({ stroke })}
              />
            </label>
          </div>
        )}
      </PropertySection>

      <PropertySection
        title={String(t("editor_page.element_properties.shadow"))}
        open={openSections.shadow}
        onToggle={() => toggleSection("shadow")}
        trailing={
          <ToggleSwitch
            checked={element.shadowEnabled}
            onChange={setShadowEnabled}
            label={String(t("editor_page.element_properties.shadow"))}
          />
        }
      >
        {element.shadowEnabled && (
          <div className="space-y-3">
            <SliderRow
              label={String(
                t("editor_page.element_properties.horizontal_shadow")
              )}
              value={element.shadow.offsetX}
              min={-50}
              max={50}
              step={1}
              onPreview={(offsetX) => previewShadow({ offsetX })}
              onCommit={(offsetX) => commitShadow({ offsetX })}
            />
            <SliderRow
              label={String(
                t("editor_page.element_properties.vertical_shadow")
              )}
              value={element.shadow.offsetY}
              min={-50}
              max={50}
              step={1}
              onPreview={(offsetY) => previewShadow({ offsetY })}
              onCommit={(offsetY) => commitShadow({ offsetY })}
            />
            <SliderRow
              label={String(t("editor_page.element_properties.fuzzy_distance"))}
              value={element.shadow.blur}
              min={0}
              max={50}
              step={1}
              onPreview={(blur) => previewShadow({ blur })}
              onCommit={(blur) => commitShadow({ blur })}
            />
            <label className="flex items-center justify-between gap-3">
              <span className="text-xs text-white/60">Shadow color</span>
              <ColorSwatch
                value={element.shadow.color}
                onPreview={(color) => previewShadow({ color })}
                onCommit={(color) => commitShadow({ color })}
              />
            </label>
          </div>
        )}
      </PropertySection>

      <div className="border-t border-white/5 pt-3">
        <SliderRow
          label={String(t("editor_page.element_properties.opacity"))}
          value={element.opacity}
          min={0}
          max={1}
          step={0.05}
          displayValue={element.opacity.toFixed(2)}
          onPreview={(opacity) => actions.updateSelectedPreview({ opacity })}
          onCommit={(opacity) => actions.updateSelected({ opacity })}
        />
      </div>

      <ArrangeSection element={element} />
    </div>
  );
};

const ArrangeSection: React.FC<{
  readonly element: EditorSelectedElement;
}> = ({ element }) => {
  const { t } = useTranslation();
  const actions = useEditorActions();

  return (
    <div className="space-y-2 border-t border-white/5 pt-3">
      <span className="text-xs font-medium text-white/70">
        {String(t("editor_page.element_properties.arrange"))}
      </span>
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outlined"
          size="sm"
          onClick={actions.centerSelectedHorizontally}
        >
          {String(t("editor_page.element_properties.h_center"))}
        </Button>
        <Button
          type="button"
          variant="outlined"
          size="sm"
          onClick={actions.centerSelectedVertically}
        >
          {String(t("editor_page.element_properties.v_center"))}
        </Button>
        <Button
          type="button"
          variant="outlined"
          size="sm"
          onClick={actions.bringSelectedToFront}
        >
          {String(t("editor_page.element_properties.front"))}
        </Button>
        <Button
          type="button"
          variant="outlined"
          size="sm"
          onClick={actions.sendSelectedToBack}
        >
          {String(t("editor_page.element_properties.back"))}
        </Button>
        <Button
          type="button"
          variant="outlined"
          size="sm"
          onClick={() => actions.lockSelected(!element.isLocked)}
        >
          {element.isLocked
            ? String(t("editor_page.element_properties.unlock"))
            : String(t("editor_page.element_properties.lock"))}
        </Button>
        <Button
          type="button"
          variant="outlined"
          size="sm"
          onClick={actions.deleteSelected}
        >
          {String(t("editor_page.element_properties.delete"))}
        </Button>
      </div>
    </div>
  );
};

interface PropertySectionProps {
  readonly title: string;
  readonly open: boolean;
  readonly onToggle: () => void;
  readonly icon?: React.ReactNode;
  readonly trailing?: React.ReactNode;
  readonly children: React.ReactNode;
}

const PropertySection: React.FC<PropertySectionProps> = ({
  title,
  open,
  onToggle,
  icon,
  trailing,
  children,
}) => (
  <div className="border-t border-white/5 py-3 first:border-t-0 first:pt-0">
    <div className="mb-2 flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex min-w-0 flex-1 items-center gap-2 text-start text-xs font-semibold tracking-wide text-white/80 uppercase"
      >
        {icon}
        <span>{title}</span>
        <svg
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={cn(
            "ms-auto shrink-0 text-white/40 transition-transform",
            open && "rotate-180"
          )}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {trailing}
    </div>
    {open && children}
  </div>
);

interface SliderRowProps {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly displayValue?: string;
  readonly onPreview?: (value: number) => void;
  readonly onCommit: (value: number) => void;
}

const SliderRow: React.FC<SliderRowProps> = ({
  label,
  value,
  min,
  max,
  step,
  displayValue,
  onPreview,
  onCommit,
}) => {
  const [liveValue, setLiveValue] = useState<number | null>(null);
  const shown = liveValue ?? value;

  const parseValue = (raw: string): number => Number.parseFloat(raw) || 0;

  const handleInput = (raw: string) => {
    const next = parseValue(raw);
    setLiveValue(next);
    (onPreview ?? onCommit)(next);
  };

  const handleCommit = (raw: string) => {
    const next = parseValue(raw);
    setLiveValue(null);
    onCommit(next);
  };

  return (
    <label className="block space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-white/60">{label}</span>
        <span className="text-xs text-white/45 tabular-nums">
          {displayValue ?? shown}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={shown}
        onInput={(event) => handleInput(event.currentTarget.value)}
        onChange={(event) => handleCommit(event.currentTarget.value)}
        className="w-full accent-[#3B82F6]"
      />
    </label>
  );
};

interface ToggleSwitchProps {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly label: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={(event) => {
      event.stopPropagation();
      onChange(!checked);
    }}
    className={cn(
      "relative h-6 w-10 shrink-0 rounded-full transition-colors",
      checked ? "bg-[#3B82F6]" : "bg-white/20"
    )}
  >
    <span
      className={cn(
        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
        checked ? "start-[18px]" : "start-0.5"
      )}
    />
  </button>
);

interface ColorSwatchProps {
  readonly value?: string;
  readonly onPreview: (value: string) => void;
  readonly onCommit: (value: string) => void;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({
  value,
  onPreview,
  onCommit,
}) => {
  const frameRef = useRef<number | null>(null);
  const pendingRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    },
    []
  );

  const schedulePreview = (next: string) => {
    pendingRef.current = next;

    if (frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      const pending = pendingRef.current;
      pendingRef.current = null;

      if (pending !== null) onPreview(pending);
    });
  };

  const handleCommit = (next: string) => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    pendingRef.current = null;
    onCommit(next);
  };

  return (
    <label className="relative flex h-9 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-white/10 bg-[#2A2D33]">
      <input
        type="color"
        value={toColorInputValue(value)}
        onInput={(event) => schedulePreview(event.currentTarget.value)}
        onChange={(event) => handleCommit(event.currentTarget.value)}
        className="h-full w-full cursor-pointer border-0 bg-transparent p-1"
      />
    </label>
  );
};
