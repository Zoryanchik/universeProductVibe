import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Input, cn } from "@universe-forma/ui-pes";

import { useTranslation } from "@/shared/lib/translations/useTranslation";

import {
  ERROR_CORRECTION_OPTIONS,
  QR_CODE_STYLES,
  useEditorActions,
} from "@/features/editor";
import type {
  EditorQRCodeState,
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

interface QRCodeElementPropertiesPanelProps {
  readonly element: EditorSelectedElement;
}

export const QRCodeElementPropertiesPanel: React.FC<
  QRCodeElementPropertiesPanelProps
> = ({ element }) => {
  const { t } = useTranslation();
  const actions = useEditorActions();
  const qr = element.qrCode;
  const [contentDraft, setContentDraft] = useState(qr?.content ?? "");
  const commitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useEffect(() => {
    setContentDraft(qr?.content ?? "");
  }, [qr?.content, element.id]);

  const commit = useCallback(
    (patch: Partial<EditorQRCodeState>) => {
      void actions.updateQRCode(patch).then((next) => {
        if (next) return;
      });
    },
    [actions]
  );

  const scheduleCommit = useCallback(
    (patch: Partial<EditorQRCodeState>) => {
      if (commitTimer.current) clearTimeout(commitTimer.current);

      commitTimer.current = setTimeout(() => commit(patch), 350);
    },
    [commit]
  );

  if (!qr) return null;

  return (
    <div className="space-y-3">
      <PropertySection title={String(t("editor_page.qr_properties.rotation"))}>
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

      <PropertySection
        title={String(t("editor_page.qr_properties.qr_code_style"))}
      >
        <div className="grid grid-cols-4 gap-2">
          {QR_CODE_STYLES.map((style) => {
            const active = qr.codeStyle === style.id;

            return (
              <button
                key={style.id}
                type="button"
                onClick={() => commit({ codeStyle: style.id })}
                className={cn(
                  "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                  active
                    ? "border-[#3B82F6] bg-[#3B82F6]/15 text-[#3B82F6]"
                    : "border-white/10 bg-[#2A2D33] text-white/70 hover:border-white/20"
                )}
              >
                {style.label}
              </button>
            );
          })}
        </div>
      </PropertySection>

      <PropertySection
        title={String(t("editor_page.qr_properties.code_content"))}
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
            t("editor_page.qr_properties.code_content_placeholder")
          )}
          className="border-white/10 bg-[#2A2D33] text-white"
        />
      </PropertySection>

      <PropertySection
        title={String(t("editor_page.qr_properties.code_margin"))}
      >
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              {
                id: "none" as const,
                label: String(t("editor_page.qr_properties.no_margin")),
              },
              {
                id: "standard" as const,
                label: String(t("editor_page.qr_properties.standard_margin")),
              },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => commit({ margin: option.id })}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm transition-colors",
                qr.margin === option.id
                  ? "border-[#3B82F6] bg-[#3B82F6]/15 text-[#3B82F6]"
                  : "border-white/10 bg-[#2A2D33] text-white/70 hover:border-white/20"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </PropertySection>

      <PropertySection
        title={String(t("editor_page.qr_properties.error_correction_rate"))}
      >
        <div className="grid grid-cols-4 gap-2">
          {ERROR_CORRECTION_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => commit({ errorCorrectionLevel: option.id })}
              className={cn(
                "rounded-lg border px-2 py-2 text-sm transition-colors",
                qr.errorCorrectionLevel === option.id
                  ? "border-[#3B82F6] bg-[#3B82F6]/15 text-[#3B82F6]"
                  : "border-white/10 bg-[#2A2D33] text-white/70 hover:border-white/20"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </PropertySection>

      <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
        <ToggleRow
          label={String(t("editor_page.qr_properties.border"))}
          checked={qr.border}
          onChange={(border) => commit({ border })}
        />
        <ToggleRow
          label={String(t("editor_page.qr_properties.shadow"))}
          checked={qr.shadow}
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
