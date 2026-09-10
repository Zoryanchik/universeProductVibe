import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@universe-forma/ui-pes";

import { useTranslation } from "@/shared/lib/translations/useTranslation";

import {
  applyPageSettings,
  formatPageDimensionValue,
  pagePxToUnit,
  pageUnitToPx,
  useEditor,
} from "@/features/editor";
import type { EditorPageSettings } from "@/features/editor";

import { toColorInputValue } from "../lib/color-utils";

interface DimensionFieldProps {
  readonly label: string;
  readonly value: string;
  readonly unitLabel: string;
  readonly disabled?: boolean;
  readonly onChange: (value: string) => void;
  readonly onBlur: () => void;
}

const DimensionField: React.FC<DimensionFieldProps> = ({
  label,
  value,
  unitLabel,
  disabled,
  onChange,
  onBlur,
}) => (
  <div className="w-full min-w-0 flex-1">
    <span className="mb-1.5 block text-xs font-medium text-white/55">
      {label}
    </span>
    <div
      className={cn(
        "relative h-9 rounded-lg border bg-[#1F2125]",
        "border-white/10 focus-within:border-[#3B82F6]/70 focus-within:ring-1 focus-within:ring-[#3B82F6]/30",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <input
        type="text"
        inputMode="decimal"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className={cn(
          "h-full w-full rounded-lg bg-transparent ps-2.5 pe-11",
          "text-start text-xs leading-none text-white tabular-nums outline-none",
          "disabled:cursor-not-allowed"
        )}
        aria-label={`${label} (${unitLabel})`}
      />
      <span
        className="pointer-events-none absolute inset-y-0 end-2.5 flex w-7 items-center justify-end text-[11px] text-white/35"
        aria-hidden
      >
        {unitLabel}
      </span>
    </div>
  </div>
);

const LockIcon: React.FC<{ readonly locked: boolean }> = ({ locked }) => (
  <svg
    width={14}
    height={14}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {locked ? (
      <>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </>
    ) : (
      <>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 7.5-2" />
      </>
    )}
  </svg>
);

export const PageDimensionsPanel: React.FC = () => {
  const { t } = useTranslation();
  const { instance, pageSettings, setPageSettings, isDocumentLoaded } =
    useEditor();

  const [draft, setDraft] = useState<EditorPageSettings>({
    unit: "mm",
    width: 0,
    height: 0,
    background: "#ffffff",
  });
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [widthInput, setWidthInput] = useState("0");
  const [heightInput, setHeightInput] = useState("0");
  const [applyToAll, setApplyToAll] = useState(false);

  const aspectRatioRef = useRef(1);
  const draftRef = useRef(draft);
  const applyToAllRef = useRef(applyToAll);

  draftRef.current = draft;
  applyToAllRef.current = applyToAll;

  const updateDraft = useCallback(
    (updater: (prev: EditorPageSettings) => EditorPageSettings) => {
      setDraft((prev) => {
        const next = updater(prev);
        draftRef.current = next;

        return next;
      });
    },
    []
  );

  const syncInputsFromDraft = useCallback((next: EditorPageSettings) => {
    setWidthInput(formatPageDimensionValue(next.width, next.unit));
    setHeightInput(formatPageDimensionValue(next.height, next.unit));
    if (next.height > 0) {
      aspectRatioRef.current = next.width / next.height;
    }
  }, []);

  useEffect(() => {
    if (!pageSettings) return;

    const next: EditorPageSettings = {
      unit: draftRef.current.unit,
      width: pagePxToUnit(pageSettings.width, draftRef.current.unit),
      height: pagePxToUnit(pageSettings.height, draftRef.current.unit),
      background: toColorInputValue(pageSettings.background),
    };

    draftRef.current = next;
    setDraft(next);
    setWidthInput(formatPageDimensionValue(next.width, next.unit));
    setHeightInput(formatPageDimensionValue(next.height, next.unit));
    if (next.height > 0) {
      aspectRatioRef.current = next.width / next.height;
    }
  }, [pageSettings]);

  const toPixelSettings = (
    nextDraft: EditorPageSettings
  ): EditorPageSettings => ({
    unit: "px",
    width: pageUnitToPx(nextDraft.width, nextDraft.unit),
    height: pageUnitToPx(nextDraft.height, nextDraft.unit),
    background: nextDraft.background,
  });

  const applyFromDraft = useCallback(
    async (nextDraft: EditorPageSettings) => {
      if (!instance || !isDocumentLoaded) return;

      const nextPx = toPixelSettings(nextDraft);
      const matchesCurrentPage =
        pageSettings &&
        pageSettings.width === nextPx.width &&
        pageSettings.height === nextPx.height &&
        toColorInputValue(pageSettings.background) ===
          toColorInputValue(nextPx.background);

      if (matchesCurrentPage && !applyToAllRef.current) {
        setDraft(nextDraft);
        syncInputsFromDraft(nextDraft);

        return;
      }

      await applyPageSettings(instance, nextPx, applyToAllRef.current);
      setPageSettings(nextPx);
      setDraft(nextDraft);
      syncInputsFromDraft(nextDraft);
    },
    [
      instance,
      isDocumentLoaded,
      pageSettings,
      setPageSettings,
      syncInputsFromDraft,
    ]
  );

  const commitSettings = useCallback(async () => {
    if (!isDocumentLoaded) return;

    const current = draftRef.current;
    const nextDraft: EditorPageSettings = {
      ...current,
      width: parseDimension(widthInput, current.width),
      height: parseDimension(heightInput, current.height),
      background: toColorInputValue(current.background),
    };

    draftRef.current = nextDraft;
    setDraft(nextDraft);
    await applyFromDraft(nextDraft);
  }, [applyFromDraft, isDocumentLoaded, widthInput, heightInput]);

  const handleUnitChange = (unit: EditorPageSettings["unit"]) => {
    if (!isDocumentLoaded) return;

    const prev = draftRef.current;
    const converted: EditorPageSettings = {
      ...prev,
      unit,
      width: pagePxToUnit(pageUnitToPx(prev.width, prev.unit), unit),
      height: pagePxToUnit(pageUnitToPx(prev.height, prev.unit), unit),
    };

    updateDraft(() => converted);
    syncInputsFromDraft(converted);
    void applyFromDraft(converted);
  };

  const parseDimension = (raw: string, fallback: number): number => {
    const parsed = Number.parseFloat(raw.replace(",", "."));

    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const handleWidthInput = (raw: string) => {
    if (!isDocumentLoaded) return;

    setWidthInput(raw);

    const width = parseDimension(raw, draft.width);
    updateDraft((prev) => {
      const next = { ...prev, width };

      if (lockAspectRatio && aspectRatioRef.current > 0) {
        const height = Math.round((width / aspectRatioRef.current) * 100) / 100;
        next.height = height;
        setHeightInput(formatPageDimensionValue(height, prev.unit));
      }

      return next;
    });
  };

  const handleHeightInput = (raw: string) => {
    if (!isDocumentLoaded) return;

    setHeightInput(raw);

    const height = parseDimension(raw, draft.height);
    updateDraft((prev) => {
      const next = { ...prev, height };

      if (lockAspectRatio && aspectRatioRef.current > 0) {
        const width = Math.round(height * aspectRatioRef.current * 100) / 100;
        next.width = width;
        setWidthInput(formatPageDimensionValue(width, prev.unit));
      }

      return next;
    });
  };

  const handleBlur = () => {
    if (!isDocumentLoaded) return;

    void commitSettings();
  };

  const toggleAspectLock = () => {
    if (!isDocumentLoaded) return;

    setLockAspectRatio((prev) => {
      const next = !prev;

      if (next && draft.height > 0) {
        aspectRatioRef.current = draft.width / draft.height;
      }

      return next;
    });
  };

  const unitLabels: Record<EditorPageSettings["unit"], string> = {
    mm: "mm",
    in: "in",
    px: "px",
  };
  const unitLabel = unitLabels[draft.unit];

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-white/10 bg-[#2A2D33] p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xs font-bold tracking-wide text-white/90">
            {String(t("editor_page.page_dimensions.title"))}
          </h3>
          <div className="relative shrink-0">
            <select
              value={draft.unit}
              disabled={!isDocumentLoaded}
              onChange={(event) =>
                handleUnitChange(
                  event.target.value as EditorPageSettings["unit"]
                )
              }
              className={cn(
                "h-8 appearance-none rounded-md border border-[#3B82F6]/50 bg-[#1F2125] ps-2.5 pe-7",
                "text-xs font-medium text-[#3B82F6] outline-none",
                "focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/40",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              aria-label={String(
                t("editor_page.page_dimensions.measurement_unit")
              )}
            >
              <option value="mm">mm</option>
              <option value="px">px</option>
              <option value="in">in</option>
            </select>
            <svg
              className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-[#3B82F6]"
              width={12}
              height={12}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_1.75rem_minmax(0,1fr)] items-end gap-1.5">
          <DimensionField
            label={String(t("editor_page.page_dimensions.width"))}
            value={widthInput}
            unitLabel={unitLabel}
            disabled={!isDocumentLoaded}
            onChange={handleWidthInput}
            onBlur={handleBlur}
          />

          <button
            type="button"
            aria-label={
              lockAspectRatio
                ? String(t("editor_page.page_dimensions.unlock_aspect_ratio"))
                : String(t("editor_page.page_dimensions.lock_aspect_ratio"))
            }
            aria-pressed={lockAspectRatio}
            disabled={!isDocumentLoaded}
            onClick={toggleAspectLock}
            className={cn(
              "mb-0.5 flex h-8 w-7 shrink-0 items-center justify-center rounded-md border transition-colors",
              lockAspectRatio
                ? "border-[#3B82F6]/40 bg-[#3B82F6]/15 text-[#3B82F6]"
                : "border-white/10 bg-[#1F2125] text-white/40 hover:text-white/70",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            <LockIcon locked={lockAspectRatio} />
          </button>

          <DimensionField
            label={String(t("editor_page.page_dimensions.height"))}
            value={heightInput}
            unitLabel={unitLabel}
            disabled={!isDocumentLoaded}
            onChange={handleHeightInput}
            onBlur={handleBlur}
          />
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-white/10 bg-[#2A2D33] p-4">
        <h3 className="text-xs font-bold tracking-wide text-white/90">
          {String(t("editor_page.page_dimensions.page_background_title"))}
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={toColorInputValue(draft.background)}
            disabled={!isDocumentLoaded}
            onChange={(event) => {
              if (!isDocumentLoaded) return;

              const background = toColorInputValue(event.target.value);
              updateDraft((prev) => ({ ...prev, background }));
            }}
            onBlur={handleBlur}
            className={cn(
              "h-10 w-14 rounded-lg border border-white/10 bg-[#1F2125] p-1",
              "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            )}
            aria-label={String(
              t("editor_page.page_dimensions.page_background_color")
            )}
          />
          <span className="text-xs text-white/45">
            {String(t("editor_page.page_dimensions.background_hint"))}
          </span>
        </div>

        <label
          className={cn(
            "flex items-center gap-2 text-xs text-white/60",
            isDocumentLoaded
              ? "cursor-pointer"
              : "cursor-not-allowed opacity-50"
          )}
        >
          <input
            type="checkbox"
            checked={applyToAll}
            disabled={!isDocumentLoaded}
            onChange={(event) => {
              if (!isDocumentLoaded) return;

              const checked = event.target.checked;
              applyToAllRef.current = checked;
              setApplyToAll(checked);

              if (checked) {
                void commitSettings();
              }
            }}
            className="accent-[#3B82F6]"
          />
          {String(t("editor_page.page_dimensions.apply_to_all_pages"))}
        </label>
      </section>
    </div>
  );
};
