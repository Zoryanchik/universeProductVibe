import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Input, cn } from "@universe-forma/ui-pes";

import { useTranslation } from "@/shared/lib/translations/useTranslation";

import {
  DEFAULT_EDITOR_EXPORT_SETTINGS,
  useEditor,
} from "@/features/editor/@x/editor-download";

import { useDownloadDocument } from "../model/useDownloadDocument";
import type {
  DownloadDpi,
  DownloadFormState,
  DownloadFormat,
} from "../model/types";

const FORMATS: { id: DownloadFormat; label: string }[] = [
  { id: "pdf", label: "PDF" },
  { id: "png", label: "PNG" },
  { id: "jpeg", label: "JPEG" },
];

const DPI_OPTIONS: { id: DownloadDpi; label: string }[] = [
  { id: 72, label: "72 DPI" },
  { id: 150, label: "150 DPI" },
  { id: 300, label: "300 DPI" },
];

const stripExtension = (name: string): string =>
  name.replace(/\.(pdf|png|jpe?g)$/i, "");

export const DownloadModal: React.FC = () => {
  const { t } = useTranslation();
  const {
    isDownloadOpen,
    closeDownload,
    filename,
    instance,
    pageCount,
    documentSource,
  } = useEditor();

  const scopes = useMemo(
    () => [
      {
        id: "all" as const,
        label: String(t("editor_page.download_modal.all_pages")),
      },
      {
        id: "current" as const,
        label: String(t("editor_page.download_modal.current_page")),
      },
    ],
    [t]
  );

  const [form, setForm] = useState<DownloadFormState>({
    filename: stripExtension(filename || "document"),
    format: "pdf",
    scope: "all",
    quality: DEFAULT_EDITOR_EXPORT_SETTINGS.quality,
    dpi: DEFAULT_EDITOR_EXPORT_SETTINGS.dpi,
    ignoreBlankEdges: DEFAULT_EDITOR_EXPORT_SETTINGS.ignoreBlankEdges,
  });

  useEffect(() => {
    if (isDownloadOpen) {
      setForm((prev) => ({
        ...prev,
        filename: stripExtension(filename || "document"),
      }));
    }
  }, [isDownloadOpen, filename]);

  const { exportAndDownload, isExporting, error } = useDownloadDocument({
    instance,
    pageCount,
    documentSource,
  });

  useEffect(() => {
    if (!isDownloadOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDownload();
    };
    document.addEventListener("keydown", handler);

    return () => document.removeEventListener("keydown", handler);
  }, [isDownloadOpen, closeDownload]);

  if (!isDownloadOpen || typeof document === "undefined") return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await exportAndDownload(form);
    if (ok) closeDownload();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeDownload();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#1F2125] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">
            {String(t("editor_page.download_modal.title"))}
          </h2>
          <button
            type="button"
            onClick={closeDownload}
            aria-label={String(t("editor_page.download_modal.close"))}
            className="flex h-8 w-8 items-center justify-center rounded text-white/50 hover:bg-white/10 hover:text-white"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-white/70"
              htmlFor="dl-filename"
            >
              {String(t("editor_page.download_modal.file_name"))}
            </label>
            <Input
              id="dl-filename"
              size="dense"
              bg="filled"
              value={form.filename}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, filename: e.target.value }))
              }
              placeholder={String(
                t("editor_page.download_modal.file_name_placeholder")
              )}
              className="border-white/10 bg-[#2A2D33] text-white"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium text-white/70">
              {String(t("editor_page.download_modal.format"))}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {FORMATS.map((opt) => {
                const isActive = form.format === opt.id;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, format: opt.id }))
                    }
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "border-[#3B82F6] bg-[#3B82F6]/15 text-[#3B82F6]"
                        : "border-white/10 bg-[#2A2D33] text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium text-white/70">
              {String(t("editor_page.download_modal.pages"))}
            </span>
            <div className="flex gap-3">
              {scopes.map((opt) => {
                const isActive = form.scope === opt.id;

                return (
                  <label
                    key={opt.id}
                    className={cn(
                      "flex flex-1 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                      isActive
                        ? "border-[#3B82F6] bg-[#3B82F6]/15 text-white"
                        : "border-white/10 bg-[#2A2D33] text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <input
                      type="radio"
                      name="dl-scope"
                      checked={isActive}
                      onChange={() =>
                        setForm((prev) => ({ ...prev, scope: opt.id }))
                      }
                      className="accent-[#3B82F6]"
                    />
                    {opt.label}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/70">
                {String(t("editor_page.download_modal.image_quality"))}
              </span>
              <span className="text-xs text-white/50">
                {Math.round(form.quality * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={form.quality}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  quality: Number.parseFloat(e.target.value),
                }))
              }
              className="w-full accent-[#3B82F6]"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium text-white/70">
              {String(t("editor_page.download_modal.image_resolution"))}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {DPI_OPTIONS.map((opt) => {
                const isActive = form.dpi === opt.id;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, dpi: opt.id }))
                    }
                    className={cn(
                      "rounded-lg border px-2 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "border-[#3B82F6] bg-[#3B82F6]/15 text-[#3B82F6]"
                        : "border-white/10 bg-[#2A2D33] text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-sm font-medium text-white/70">
                {String(t("editor_page.download_modal.ignore_blank_edges"))}
              </span>
              <p className="text-xs text-white/50">
                {String(
                  t("editor_page.download_modal.ignore_blank_edges_hint")
                )}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.ignoreBlankEdges}
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  ignoreBlankEdges: !prev.ignoreBlankEdges,
                }))
              }
              className={cn(
                "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                form.ignoreBlankEdges ? "bg-[#3B82F6]" : "bg-white/20"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
                  form.ignoreBlankEdges ? "start-[22px]" : "start-0.5"
                )}
              />
            </button>
          </div>

          {error && (
            <p className="rounded-md border border-red-500/30 bg-red-950/20 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/10 bg-[#1A1C1E] px-6 py-4">
          <button
            type="button"
            onClick={closeDownload}
            disabled={isExporting}
            className="rounded-lg border border-white/15 bg-transparent px-5 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {String(t("editor_page.download_modal.cancel"))}
          </button>
          <button
            type="submit"
            disabled={isExporting}
            className="rounded-lg bg-[#3B82F6] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExporting
              ? String(t("editor_page.download_modal.preparing"))
              : String(t("editor_page.download_modal.download"))}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
};
