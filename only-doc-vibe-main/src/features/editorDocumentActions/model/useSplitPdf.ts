import { useCallback, useState } from "react";

import { useTranslation } from "@/shared/lib/translations/useTranslation";

import {
  DEFAULT_EDITOR_EXPORT_SETTINGS,
  exportDocumentPdfRange,
} from "@/features/editor/@x/editor-document-actions";
import type {
  PageRange,
  PDFEditorInstance,
} from "@/features/editor/@x/editor-document-actions";

const stripExtension = (name: string): string =>
  name.replace(/\.(pdf|png|jpe?g)$/i, "");

const triggerDownload = (blob: Blob, filename: string) => {
  if (!blob || blob.size === 0) {
    throw new Error("SPLIT_EMPTY_OUTPUT");
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

interface UseSplitPdfParams {
  instance: PDFEditorInstance | null;
  pageCount: number;
}

export const useSplitPdf = ({ instance, pageCount }: UseSplitPdfParams) => {
  const { t } = useTranslation();
  const [isSplitting, setIsSplitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const splitAndDownload = useCallback(
    async (filename: string, range: PageRange): Promise<boolean> => {
      if (!instance) {
        setError(String(t("editor_page.errors.editor_not_initialized")));

        return false;
      }

      const start = Math.round(range.start);
      const end = Math.round(range.end);
      const max = Math.max(1, pageCount);
      const inRange = (value: number): boolean =>
        Number.isFinite(value) && value >= 1 && value <= max;

      if (!inRange(start) || !inRange(end) || start > end) {
        setError(
          String(
            t("editor_page.split_modal.invalid_range", {
              max,
            })
          )
        );

        return false;
      }

      setIsSplitting(true);
      setError(null);

      try {
        const baseName = stripExtension(filename || "split");
        const blob = await exportDocumentPdfRange(
          instance,
          DEFAULT_EDITOR_EXPORT_SETTINGS,
          { start, end }
        );
        triggerDownload(blob, `${baseName}.pdf`);

        return true;
      } catch (err) {
        let message = String(t("editor_page.errors.export_failed"));
        if (err instanceof Error && err.message === "SPLIT_EMPTY_OUTPUT") {
          message = String(t("editor_page.errors.export_empty_file"));
        } else if (err instanceof Error) {
          message = err.message;
        }

        setError(message);
        console.error("[useSplitPdf]", err);

        return false;
      } finally {
        setIsSplitting(false);
      }
    },
    [instance, pageCount, t]
  );

  const resetError = useCallback(() => setError(null), []);

  return { splitAndDownload, isSplitting, error, resetError };
};
