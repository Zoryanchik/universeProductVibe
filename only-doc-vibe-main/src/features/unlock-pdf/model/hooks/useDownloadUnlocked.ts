import { useRef } from "react";

import { useSSEWithPollingFallback } from "@/shared/lib/utils/useSSEWithPollingFallback";
import useEventCallback from "@/shared/lib/state/useEventCallback";
import { ESSEventType } from "@/shared/api/sse/sse-event-type";
import {
  closeModal,
  updateCurrentModalOptions,
} from "@/shared/lib/modals/modals-store";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import { downloadByUrl } from "@/shared/lib/documents/downloadByUrl";
import { useTranslation } from "@/shared/lib/translations";

import {
  EProcessingStatus,
  getDocumentById,
  getFileStatus,
} from "@/entities/documents";

const UNLOCK_POLLING_TIMEOUT_MS = 300_000;

export const useDownloadUnlocked = () => {
  const { t } = useTranslation();
  const fileIdRef = useRef<string | null>(null);

  const handleReady = useEventCallback(async (fileId: string) => {
    const document = await getDocumentById(fileId);
    downloadByUrl({ url: document.url, filename: document.filename });
    closeModal(EModalsTypes.UNLOCK_PDF_MODAL);
  });

  const showError = useEventCallback((message: string) => {
    updateCurrentModalOptions(EModalsTypes.UNLOCK_PDF_MODAL, (prev) => {
      if (prev.isSubmitting || prev.isPasswordFormVisible) {
        return prev;
      }

      return {
        ...prev,
        isPasswordFormVisible: true,
        passwordError: message,
      };
    });
  });

  const handleFailed = useEventCallback(
    (args: { error_code?: string | null; error_message?: string | null }) => {
      const message =
        args.error_code === "PDF_UNLOCK_INCORRECT_PASSWORD"
          ? String(t("modals.unlock_pdf.errors.incorrect_password"))
          : String(t("modals.unlock_pdf.errors.unlock_failed"));

      showError(message);
    }
  );

  const { startWaitingSSEEvent, isLoading } = useSSEWithPollingFallback({
    sseEvent: ESSEventType.FILE_PROCESSING_RESULT,
    sseWaitTimeoutMs: 10_000,
    shouldHandleSSEEvent: (data) =>
      fileIdRef.current !== null && data.data.id === fileIdRef.current,
    onSSEEvent: useEventCallback(async (data) => {
      if (data.data.processing_status === EProcessingStatus.FAILED) {
        handleFailed({
          error_code: data.data.error_code,
          error_message: data.data.error_message,
        });

        return;
      }

      if (data.data.processing_status !== EProcessingStatus.READY) {
        return;
      }

      await handleReady(data.data.id);
    }),
    poller: useEventCallback(async () => {
      const fileId = fileIdRef.current;
      if (!fileId) {
        throw new Error("Document ID is not set");
      }

      const status = await getFileStatus(fileId);

      if (status.processing_status === EProcessingStatus.FAILED) {
        handleFailed({
          error_code: status.error_code,
          error_message: status.error_message,
        });

        return;
      }

      if (status.processing_status !== EProcessingStatus.READY) {
        throw new Error("Unlocked file is not ready yet");
      }

      await handleReady(status.id);
    }),
    pollingOptions: {
      intervalMs: 5_000,
      stopTimeoutMs: UNLOCK_POLLING_TIMEOUT_MS,
      onTimedOut: () => {
        showError(String(t("modals.unlock_pdf.errors.timed_out")));
      },
    },
  });

  const startWaitingUnlock = useEventCallback((fileId: string) => {
    fileIdRef.current = fileId;
    startWaitingSSEEvent();
  });

  return { startWaitingUnlock, isLoading };
};
