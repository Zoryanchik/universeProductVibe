import { useCallback, useState } from "react";

import { useTranslation } from "@/shared/lib/translations/useTranslation";

import type {
  EditorExportSettings,
  PDFEditorInstance,
} from "@/features/editor/@x/editor-download";
import {
  exportCurrentPageImage,
  exportDocumentImages,
  exportDocumentPdf,
  resolveExportPageRange,
} from "@/features/editor/@x/editor-download";

import type { DownloadFormState } from "./types";

const toExportSettings = (state: DownloadFormState): EditorExportSettings => ({
  scope: resolveExportPageRange(state.scope),
  quality: state.quality,
  dpi: state.dpi,
  ignoreBlankEdges: state.ignoreBlankEdges,
});

const stripExtension = (name: string): string =>
  name.replace(/\.(pdf|png|jpe?g)$/i, "");

const extensionFor = (format: DownloadFormState["format"]): string => {
  switch (format) {
    case "png":
      return "png";
    case "jpeg":
      return "jpg";
    default:
      return "pdf";
  }
};

const triggerDownload = (blob: Blob, filename: string) => {
  if (!blob || blob.size === 0) {
    throw new Error("EXPORT_EMPTY_FILE");
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

interface UseDownloadDocumentParams {
  instance: PDFEditorInstance | null;
  pageCount: number;
  /** Original document URL/data URL — enables vector reuse for unedited pages. */
  documentSource?: string | null;
}

export const useDownloadDocument = ({
  instance,
  pageCount,
  documentSource,
}: UseDownloadDocumentParams) => {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportAndDownload = useCallback(
    async (state: DownloadFormState) => {
      if (!instance) {
        setError(String(t("editor_page.errors.editor_not_initialized")));

        return false;
      }

      setIsExporting(true);
      setError(null);

      try {
        const baseName = stripExtension(state.filename || "document");
        const ext = extensionFor(state.format);
        const exportSettings = toExportSettings(state);

        if (state.format === "pdf") {
          const blob = await exportDocumentPdf(
            instance,
            exportSettings,
            documentSource
          );
          triggerDownload(blob, `${baseName}.${ext}`);
        } else if (state.format === "png" || state.format === "jpeg") {
          if (state.scope === "current" || pageCount <= 1) {
            const blob = exportCurrentPageImage(
              instance,
              state.format,
              state.quality,
              {
                dpi: state.dpi,
                ignoreBlankEdges: state.ignoreBlankEdges,
              }
            );
            triggerDownload(blob, `${baseName}.${ext}`);
          } else {
            const zipBlob = await exportDocumentImages(
              instance,
              state.format,
              exportSettings
            );
            triggerDownload(zipBlob, `${baseName}.zip`);
          }
        }

        return true;
      } catch (err) {
        let message = String(t("editor_page.errors.export_failed"));
        if (err instanceof Error && err.message === "EXPORT_EMPTY_FILE") {
          message = String(t("editor_page.errors.export_empty_file"));
        } else if (err instanceof Error) {
          message = err.message;
        }

        setError(message);
        console.error("[useDownloadDocument]", err);

        return false;
      } finally {
        setIsExporting(false);
      }
    },
    [instance, pageCount, documentSource, t]
  );

  return { exportAndDownload, isExporting, error };
};
