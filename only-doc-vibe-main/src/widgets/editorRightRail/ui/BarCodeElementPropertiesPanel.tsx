import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Input, cn } from "@universe-forma/ui-pes";

import { useTranslation } from "@/shared/lib/translations/useTranslation";

import { BARCODE_FORMATS, useEditorActions } from "@/features/editor";
import type {
  EditorBarCodeState,
  EditorSelectedElement,
} from "@/features/editor";

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

interface BarCodeElementPropertiesPanelProps {
  readonly element: EditorSelectedElement;
}

export const BarCodeElementPropertiesPanel: React.FC<
  BarCodeElementPropertiesPanelProps
> = ({ element }) => {
  const { t } = useTranslation();
  const actions = useEditorActions();
  const bar = element.barCode;
  const [contentDraft, setContentDraft] = useState(bar?.content ?? "");
  const commitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useEffect(() => {
    setContentDraft(bar?.content ?? "");
  }, [bar?.content, element.id]);

  const commit = useCallback(
    (patch: Partial<EditorBarCodeState>) => {
      void actions.updateBarCode(patch);
    },
    [actions]
  );

  const scheduleCommit = useCallback(
    (patch: Partial<EditorBarCodeState>) => {
      if (commitTimer.current) clearTimeout(commitTimer.current);

      commitTimer.current = setTimeout(() => commit(patch), 350);
    },
    [commit]
  );

  if (!bar) return null;

  return (
    <div className="space-y-3">
      <PropertySection
        title={String(t("editor_page.barcode_properties.rotation"))}
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

      <PropertySection title={String(t("editor_page.barcode_properties.code"))}>
        <select
          value={bar.format}
          onChange={(event) =>
            commit({
              format: event.target.value as EditorBarCodeState["format"],
            })
          }
          className="h-10 w-full rounded-lg border border-white/10 bg-[#2A2D33] px-3 text-sm text-white"
        >
          {BARCODE_FORMATS.map((format) => (
            <option key={format.id} value={format.id}>
              {format.label}
            </option>
          ))}
        </select>
      </PropertySection>

      <PropertySection
        title={String(t("editor_page.barcode_properties.code_value"))}
      >
        <Input
          size="dense"
          bg="filled"
          value={contentDraft}
          onChange={(event) => {
            const value = event.target.value;
            setContentDraft(value);
            scheduleCommit({ content: value });
          }}
          onBlur={() => commit({ content: contentDraft })}
          placeholder={String(
            t("editor_page.barcode_properties.code_value_placeholder")
          )}
          className="border-white/10 bg-[#2A2D33] text-white"
        />
      </PropertySection>

      <PropertySection
        title={String(t("editor_page.barcode_properties.bar_width"))}
      >
        <input
          type="number"
          min={1}
          max={6}
          value={bar.barWidth}
          onChange={(event) =>
            commit({
              barWidth: Math.min(
                6,
                Math.max(1, Number.parseInt(event.target.value, 10) || 1)
              ),
            })
          }
          className="h-10 w-full rounded-lg border border-white/10 bg-[#2A2D33] px-3 text-sm text-white"
        />
      </PropertySection>

      <PropertySection title="Height">
        <input
          type="number"
          min={20}
          max={200}
          value={bar.height}
          onChange={(event) =>
            commit({
              height: Math.min(
                200,
                Math.max(20, Number.parseInt(event.target.value, 10) || 80)
              ),
            })
          }
          className="h-10 w-full rounded-lg border border-white/10 bg-[#2A2D33] px-3 text-sm text-white"
        />
      </PropertySection>

      <PropertySection
        title={String(t("editor_page.barcode_properties.colors"))}
      >
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1 text-xs text-white/60">
            <span>
              {String(t("editor_page.barcode_properties.background"))}
            </span>
            <input
              type="color"
              value={bar.background}
              onChange={(event) => commit({ background: event.target.value })}
              className="h-10 w-full rounded-lg border border-white/10 bg-[#2A2D33]"
            />
          </label>
          <label className="space-y-1 text-xs text-white/60">
            <span>
              {String(t("editor_page.barcode_properties.code_color"))}
            </span>
            <input
              type="color"
              value={bar.lineColor}
              onChange={(event) => commit({ lineColor: event.target.value })}
              className="h-10 w-full rounded-lg border border-white/10 bg-[#2A2D33]"
            />
          </label>
        </div>
      </PropertySection>

      <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
        <ToggleRow
          label="Border"
          checked={bar.border}
          onChange={(border) => commit({ border })}
        />
        <ToggleRow
          label="Shadow"
          checked={bar.shadow}
          onChange={(shadow) => commit({ shadow })}
        />
      </div>
    </div>
  );
};

const PropertySection: React.FC<{
  readonly title: string;
  readonly children: React.ReactNode;
}> = ({ title, children }) => (
  <section className="space-y-2 border-t border-white/5 pt-3 first:border-t-0 first:pt-0">
    <h3 className="text-xs font-semibold tracking-wide text-white/80 uppercase">
      {title}
    </h3>
    {children}
  </section>
);

const ToggleRow: React.FC<{
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => (
  <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#2A2D33] px-3 py-2 text-sm text-white/80">
    <span>{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
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
  </label>
);
