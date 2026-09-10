import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button, Input } from "@universe-forma/ui-pes";

import { useTranslation } from "@/shared/lib/translations/useTranslation";

import { useEditor } from "@/features/editor/@x/editor-document-actions";

import { useSplitPdf } from "../model/useSplitPdf";

const stripExtension = (name: string): string =>
  name.replace(/\.(pdf|png|jpe?g)$/i, "");

const clampPage = (raw: string, max: number): number => {
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) return 1;

  return Math.min(Math.max(1, parsed), Math.max(1, max));
};

export const SplitPdfModal: React.FC = () => {
  const { t } = useTranslation();
  const {
    isSplitOpen,
    closeSplit,
    filename,
    instance,
    pageCount,
    currentPage,
  } = useEditor();

  const { splitAndDownload, isSplitting, error, resetError } = useSplitPdf({
    instance,
    pageCount,
  });

  const [outputName, setOutputName] = useState<string>("split");
  const [startInput, setStartInput] = useState<string>("1");
  const [endInput, setEndInput] = useState<string>("1");

  useEffect(() => {
    if (!isSplitOpen) return;

    const base = stripExtension(filename || "document");
    setOutputName(base ? `${base}-split` : "split");
    setStartInput(String(Math.max(1, currentPage || 1)));
    setEndInput(String(Math.max(1, pageCount || 1)));
    resetError();
  }, [isSplitOpen, filename, currentPage, pageCount, resetError]);

  useEffect(() => {
    if (!isSplitOpen) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSplit();
    };
    document.addEventListener("keydown", handler);

    return () => document.removeEventListener("keydown", handler);
  }, [isSplitOpen, closeSplit]);

  if (!isSplitOpen || typeof document === "undefined") return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const start = clampPage(startInput, pageCount);
    const end = clampPage(endInput, pageCount);
    const ok = await splitAndDownload(outputName, { start, end });
    if (ok) closeSplit();
  };

  const max = Math.max(1, pageCount);
  const pageCountLabel =
    pageCount === 1
      ? String(t("editor_page.split_modal.page_count_one"))
      : String(t("editor_page.split_modal.page_count", { count: pageCount }));

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeSplit();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#1F2125] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">
            {String(t("editor_page.split_modal.title"))}
          </h2>
          <button
            type="button"
            onClick={closeSplit}
            aria-label={String(t("editor_page.split_modal.close"))}
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
          <p className="text-sm text-white/60">
            {String(t("editor_page.split_modal.description"))}
          </p>

          <p className="rounded-md border border-white/10 bg-[#2A2D33] px-3 py-2 text-xs text-white/60">
            {pageCountLabel}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-white/70"
                htmlFor="split-start"
              >
                {String(t("editor_page.split_modal.from_page"))}
              </label>
              <Input
                id="split-start"
                type="number"
                min={1}
                max={max}
                size="dense"
                bg="filled"
                value={startInput}
                onChange={(e) => setStartInput(e.target.value)}
                className="border-white/10 bg-[#2A2D33] text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-white/70"
                htmlFor="split-end"
              >
                {String(t("editor_page.split_modal.to_page"))}
              </label>
              <Input
                id="split-end"
                type="number"
                min={1}
                max={max}
                size="dense"
                bg="filled"
                value={endInput}
                onChange={(e) => setEndInput(e.target.value)}
                className="border-white/10 bg-[#2A2D33] text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-white/70"
              htmlFor="split-filename"
            >
              {String(t("editor_page.split_modal.file_name"))}
            </label>
            <Input
              id="split-filename"
              size="dense"
              bg="filled"
              value={outputName}
              onChange={(e) => setOutputName(e.target.value)}
              placeholder={String(
                t("editor_page.split_modal.file_name_placeholder")
              )}
              className="border-white/10 bg-[#2A2D33] text-white"
            />
          </div>

          {error && (
            <p className="rounded-md border border-red-500/30 bg-red-950/20 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/10 bg-[#1A1C1E] px-6 py-4">
          <Button
            type="button"
            variant="outlined"
            size="md"
            onClick={closeSplit}
            disabled={isSplitting}
          >
            {String(t("editor_page.split_modal.cancel"))}
          </Button>
          <Button type="submit" size="md" disabled={isSplitting}>
            {isSplitting
              ? String(t("editor_page.split_modal.preparing"))
              : String(t("editor_page.split_modal.split_and_download"))}
          </Button>
        </div>
      </form>
    </div>,
    document.body
  );
};
