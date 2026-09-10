import { useCallback } from "react";

import { InternalFileType } from "@/shared/constants/file-type";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import { trackFileUploadStatus } from "@/shared/lib/analytics";
import { navigateToEditor } from "@/shared/lib/navigation/navigateToEditor";
import { fileToBase64 } from "@/shared/lib/documents/fileToBase64";
import { countPdfPages } from "@/shared/lib/documents/countPdfPages";
import { closeModal, openModal } from "@/shared/lib/modals/modals-store";
import { logger } from "@/shared/lib/utils/logger";
import { wait } from "@/shared/lib/utils/wait";
import { useTranslation } from "@/shared/lib/translations/useTranslation";
import { getFileNameWithoutFormat } from "@/shared/lib/documents/getFilenameWithoutFormat";

import {
  EFunnels,
  prepareEditorHandoff,
  prepareMergeEditorHandoff,
  setMergeHandoffFiles,
  type EFunnels as EFunnelsType,
} from "@/entities/documents";

const UPLOAD_MODAL_DURATION_SECONDS = 3;
const DEFAULT_MERGED_FILENAME = "merged";

const getPagesCount = async (file: File): Promise<number> => {
  try {
    return Math.max(await countPdfPages(file), 1);
  } catch (error) {
    logger.error("Failed to count PDF pages for editor upload", error);

    return 1;
  }
};

export const useEditorUploadFlow = ({ funnel }: { funnel: EFunnelsType }) => {
  const { t } = useTranslation();

  const uploadToEditor = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      openModal({
        type: EModalsTypes.EDIT_UPLOADING,
        options: {
          downloadProgress: 0,
          durationSeconds: UPLOAD_MODAL_DURATION_SECONDS,
          filename: files[0]!.name,
        },
      });

      try {
        // Merge funnel: hand off the raw (un-merged) files so the editor opens
        // the merge window where the user arranges them before merging.
        if (funnel === EFunnels.MERGE_PDF) {
          await setMergeHandoffFiles(files);
          prepareMergeEditorHandoff({
            funnel,
            filename: DEFAULT_MERGED_FILENAME,
          });

          files.forEach((file) =>
            trackFileUploadStatus({ file, status: "success" })
          );

          await wait(500);
          navigateToEditor();

          return;
        }

        const file = files[0]!;

        const [base64, pagesCount] = await Promise.all([
          fileToBase64(file),
          getPagesCount(file),
        ]);

        await prepareEditorHandoff({
          funnel,
          filename: getFileNameWithoutFormat(file.name),
          formatFrom: InternalFileType.PDF,
          formatTo: InternalFileType.PDF,
          initialFileSize: file.size,
          initialPagesCount: pagesCount,
          pdfFileContent: base64,
        });

        trackFileUploadStatus({ file, status: "success" });

        await wait(500);
        navigateToEditor();
      } catch (error) {
        logger.error("Editor funnel upload failed", error);

        const message =
          error instanceof Error && error.message === "merge_pdfs_failed"
            ? String(t("api_errors.error.processing.merge-pdfs-failed"))
            : String(t("api_errors.error.file.file-missing"));

        throw new Error(message);
      } finally {
        closeModal(EModalsTypes.EDIT_UPLOADING);
      }
    },
    [funnel, t]
  );

  return { uploadToEditor };
};
