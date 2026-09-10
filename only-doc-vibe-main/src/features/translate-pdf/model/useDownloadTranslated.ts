import { useRef } from "react";

import { useSSEWithPollingFallback } from "@/shared/lib/utils/useSSEWithPollingFallback";
import useEventCallback from "@/shared/lib/state/useEventCallback";
import { ESSEventType } from "@/shared/api/sse/sse-event-type";
import { openModal } from "@/shared/lib/modals/modals-store";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import { downloadByUrl } from "@/shared/lib/documents/downloadByUrl";

import {
  EProcessingStatus,
  getDocumentById,
  getFileStatus,
} from "@/entities/documents";

const TRANSLATE_POLLING_TIMEOUT_MS = 300_000;

export const useDownloadTranslated = () => {
  const targetFileIdRef = useRef<string | null>(null);
  const onDownloadStartedRef = useRef<(() => void) | null>(null);

  const handleTranslateFailed = useEventCallback((errorMessage: string) => {
    openModal({
      type: EModalsTypes.FILE_UPLOAD_ERROR,
      options: { errorMessage },
    });
    onDownloadStartedRef.current?.();
  });

  const downloadTranslatedFile = useEventCallback(async (fileId: string) => {
    const document = await getDocumentById(fileId);
    downloadByUrl({ url: document.url, filename: document.filename });
    onDownloadStartedRef.current?.();
  });

  const { startWaitingSSEEvent, isLoading } = useSSEWithPollingFallback({
    sseEvent: ESSEventType.FILE_PROCESSING_RESULT,
    sseWaitTimeoutMs: 10_000,
    shouldHandleSSEEvent: (data) => {
      return (
        Boolean(targetFileIdRef.current) &&
        data.data.id === targetFileIdRef.current
      );
    },
    onSSEEvent: useEventCallback(async (data) => {
      if (data.data.processing_status === EProcessingStatus.FAILED) {
        handleTranslateFailed(JSON.stringify(data));

        return;
      }

      if (data.data.processing_status !== EProcessingStatus.READY) {
        return;
      }

      await downloadTranslatedFile(data.data.id);
    }),
    poller: useEventCallback(async () => {
      const fileId = targetFileIdRef.current;

      if (!fileId) {
        throw new Error("Document ID is not set");
      }

      const status = await getFileStatus(fileId);

      if (status.processing_status === EProcessingStatus.FAILED) {
        handleTranslateFailed(JSON.stringify(status));

        return;
      }

      if (status.processing_status !== EProcessingStatus.READY) {
        throw new Error("Translated file is not ready yet");
      }

      await downloadTranslatedFile(status.id);
    }),
    pollingOptions: {
      intervalMs: 5_000,
      stopTimeoutMs: TRANSLATE_POLLING_TIMEOUT_MS,
      onTimedOut: () => {
        handleTranslateFailed("timeout waiting");
      },
    },
  });

  const downloadTranslated = useEventCallback(
    (fileId: string, onDownloadStarted?: () => void) => {
      targetFileIdRef.current = fileId;
      onDownloadStartedRef.current = onDownloadStarted ?? null;
      startWaitingSSEEvent();
    }
  );

  return { downloadTranslated, isLoading };
};
