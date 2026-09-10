import { useCallback } from "react";

import { InternalFileType } from "@/shared/constants/file-type";
import { trackFileUploadStatus } from "@/shared/lib/analytics";
import {
  closeModal,
  openModal,
  updateCurrentModalOptions,
} from "@/shared/lib/modals/modals-store";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import { getFIleTypeFromFilename } from "@/shared/lib/documents/getFileTypeFromFilename";
import { getHasPdfUserPassword } from "@/shared/lib/documents/getHasPdfUserPassword";
import useEventCallback from "@/shared/lib/state/useEventCallback";
import {
  IncorrectPdfPasswordError,
  removePdfUserPassword,
} from "@/shared/lib/documents/removePdfUserPassword";
import { useTranslation } from "@/shared/lib/translations";
import { logger } from "@/shared/lib/utils/logger";

import {
  startDocumentFlow,
  type EFunnels,
  type EServiceType,
} from "@/entities/documents";

import { persistUnlockedFileToBackend } from "../../lib/persistUnlockedFileToBackend";

export const useUnlockPdf = ({
  funnel,
  serviceType,
}: {
  funnel: EFunnels;
  serviceType: EServiceType;
}) => {
  const { t } = useTranslation();
  const triggerClientDownload = useEventCallback(
    async (unlockedFile: File, originalName: string, originalFile: File) => {
      logger.log(
        `[ Unlock ] Client-side decrypt finished: ${originalName}, funnel: ${funnel}`
      );

      try {
        const objectUrl = URL.createObjectURL(unlockedFile);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.style.display = "none";
        link.setAttribute("download", originalName);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

        await startDocumentFlow({
          file: unlockedFile,
          funnel,
          service: serviceType,
          formatTo: InternalFileType.PDF,
        });

        trackFileUploadStatus({ file: unlockedFile, status: "success" });
        persistUnlockedFileToBackend(unlockedFile);
        closeModal(EModalsTypes.UNLOCK_PDF_MODAL);
      } catch (error) {
        logger.error("Failed to deliver decrypted PDF to browser", error);
        trackFileUploadStatus({
          file: originalFile,
          status: "error",
          errorCode: "unlock_client_download_failed",
        });
        updateCurrentModalOptions(EModalsTypes.UNLOCK_PDF_MODAL, {
          isSubmitting: false,
          passwordError: String(t("modals.unlock_pdf.errors.save_failed")),
        });
      }
    }
  );

  return useCallback(
    async (param: File | FileList) => {
      const file = param instanceof File ? param : param[0];
      if (!file) return;

      const formatFrom = getFIleTypeFromFilename(file.name);
      if (formatFrom !== InternalFileType.PDF) {
        return;
      }

      openModal({
        type: EModalsTypes.UNLOCK_PDF_MODAL,
        options: {
          file,
          funnel,
          serviceType,
          requiresPassword: false,
          onUnlocked: (unlockedFile: File) => {
            void triggerClientDownload(unlockedFile, file.name, file);
          },
        },
      });

      const isProtected = await getHasPdfUserPassword(file).catch(() => false);

      if (isProtected) {
        updateCurrentModalOptions(EModalsTypes.UNLOCK_PDF_MODAL, {
          autoStartBackend: true,
        });

        return;
      }

      const autoUnlockedFile = await removePdfUserPassword({
        file,
        password: "",
      }).catch((err) => {
        if (!(err instanceof IncorrectPdfPasswordError)) {
          logger.warn(
            "[useUnlockPdf] Owner-restriction strip failed for non-password reason",
            err
          );
        }

        return null;
      });

      if (autoUnlockedFile) {
        await triggerClientDownload(autoUnlockedFile, file.name, file);

        return;
      }

      updateCurrentModalOptions(EModalsTypes.UNLOCK_PDF_MODAL, {
        autoStartBackend: true,
      });
    },
    [funnel, serviceType, triggerClientDownload]
  );
};
