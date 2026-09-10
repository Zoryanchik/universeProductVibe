import { useCallback } from "react";

import { closeModal, openModal } from "@/shared/lib/modals/modals-store";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import { finishProgressModal } from "@/shared/lib/modals/finishProgressModal";
import { wait } from "@/shared/lib/utils/wait";
import { logger } from "@/shared/lib/utils/logger";
import { convertImagesToMergedPdf } from "@/shared/lib/documents/convertImagesToMergedPdf";
import { downloadByUrl } from "@/shared/lib/documents/downloadByUrl";
import { getFileNameWithoutFormat } from "@/shared/lib/documents/getFilenameWithoutFormat";
import { trackFileUploadStatus } from "@/shared/lib/analytics";
import { useTranslation } from "@/shared/lib/translations/useTranslation";

export const useMergeImagesToPdf = ({
  setError,
}: {
  readonly setError: (error: string | null) => void;
}) => {
  const { t } = useTranslation();

  return useCallback(
    async (files: File[]): Promise<void> => {
      const firstFile = files[0];

      if (!firstFile) return;

      setError(null);

      openModal({
        type: EModalsTypes.EDIT_UPLOADING,
        options: {
          downloadProgress: 0,
          durationSeconds: 2,
          filename: firstFile.name,
        },
      });

      try {
        const [mergedPdf] = await Promise.all([
          convertImagesToMergedPdf(files),
          wait(2_000),
        ]);

        await finishProgressModal(EModalsTypes.EDIT_UPLOADING);

        const objectUrl = URL.createObjectURL(mergedPdf);
        const baseName = getFileNameWithoutFormat(firstFile.name);
        const downloadFilename = `${baseName || "merged"}.pdf`;

        downloadByUrl({ url: objectUrl, filename: downloadFilename });

        setTimeout(() => {
          URL.revokeObjectURL(objectUrl);
        }, 1000);

        trackFileUploadStatus({ file: mergedPdf, status: "success" });
        closeModal(EModalsTypes.EDIT_UPLOADING);
      } catch (err) {
        logger.error("Failed to merge images into PDF", err);
        trackFileUploadStatus({
          file: firstFile,
          status: "error",
          errorCode: "merge_images_to_pdf_failed",
        });
        closeModal(EModalsTypes.EDIT_UPLOADING);
        setError(String(t("api_errors.unknown")));
      }
    },
    [setError, t]
  );
};
