import { type ChangeEvent, useState } from "react";
import type { StoreType } from "polotno/model/store";

import { localeNavigate } from "@/shared/lib/navigation/localeNavigate";
import { PAGE_LINKS } from "@/shared/constants/page-links";
import { downloadByUrl } from "@/shared/lib/documents/downloadByUrl";

import { useDashboardUpload } from "@/features/dashboard-upload";

import { useTemplatesEditorStore } from "../model/store/templates-editor-store";

export type ExportFormat = "pdf" | "png" | "jpg";

export interface RunExportOptions {
  share?: boolean;
}

interface UseEditorActionsParams {
  store: StoreType;
}

/**
 * Shared editor actions (rename / export / download / share / print / done) used
 * by both the desktop editor header and the mobile header + overflow menu.
 */
export const useEditorActions = ({ store }: UseEditorActionsParams) => {
  const { upload } = useDashboardUpload();
  const templateName = useTemplatesEditorStore.use.templateName();
  const setTemplateName = useTemplatesEditorStore.use.setTemplateName();

  const [isExporting, setIsExporting] = useState(false);

  const handleLogoClick = () => {
    localeNavigate(PAGE_LINKS.HOME);
  };

  const handleFileNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTemplateName(e.target.value);
  };

  const baseFilename = () => templateName || "template";

  const dataUrlToFile = async (
    dataURL: string,
    filename: string,
    type: string
  ): Promise<File> => {
    const response = await fetch(dataURL);
    const blob = await response.blob();

    return new File([blob], filename, { lastModified: Date.now(), type });
  };

  const exportPdfFile = async (): Promise<File> => {
    const dataURL = await store.toPDFDataURL({ pixelRatio: 4 });

    return dataUrlToFile(dataURL, `${baseFilename()}.pdf`, "application/pdf");
  };

  const exportImageFile = async (format: "png" | "jpg"): Promise<File> => {
    const mimeType = format === "png" ? "image/png" : "image/jpeg";
    const dataURL = await store.toDataURL({
      pageId: store.activePage?.id,
      mimeType,
      pixelRatio: 2,
    });

    return dataUrlToFile(dataURL, `${baseFilename()}.${format}`, mimeType);
  };

  const exportFile = (format: ExportFormat): Promise<File> =>
    format === "pdf" ? exportPdfFile() : exportImageFile(format);

  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    downloadByUrl({ url, filename: file.name });

    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const shareFile = async (file: File) => {
    if (!navigator.canShare?.({ files: [file] })) {
      downloadFile(file);

      return;
    }

    try {
      await navigator.share({ files: [file], title: file.name });
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") {
        console.error("Error sharing file:", error);
      }
    }
  };

  const printFile = async () => {
    const file = await exportPdfFile();
    const url = URL.createObjectURL(file);
    const iframe = document.createElement("iframe");
    iframe.style.visibility = "hidden";
    iframe.src = url;

    document.body.appendChild(iframe);

    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (error) {
        console.error("Error during printing:", error);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
  };

  const handlePrint = () => {
    void printFile();
  };

  /**
   * Exports the current document in the given format and either shares it or
   * downloads it and persists a copy to the user's dashboard ("Done").
   */
  const runExport = (
    format: ExportFormat,
    { share }: RunExportOptions = {}
  ) => {
    setIsExporting(true);

    void exportFile(format)
      .then((file) => {
        if (share) {
          return shareFile(file);
        }

        downloadFile(file);
        void upload([file]);
      })
      .catch((error) => console.error("Error exporting file:", error))
      .finally(() => setIsExporting(false));
  };

  return {
    templateName,
    isExporting,
    handleLogoClick,
    handleFileNameChange,
    exportFile,
    downloadFile,
    shareFile,
    printFile,
    handlePrint,
    runExport,
  };
};
