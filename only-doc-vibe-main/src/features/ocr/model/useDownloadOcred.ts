import { useRef } from "react";

import { useSSEWithPollingFallback } from "@/shared/lib/utils/useSSEWithPollingFallback";
import useEventCallback from "@/shared/lib/state/useEventCallback";
import { ESSEventType } from "@/shared/api/sse/sse-event-type";
import { openModal } from "@/shared/lib/modals/modals-store";
import { EModalsTypes } from "@/shared/constants/modals-keys";

import {
  EProcessingStatus,
  useDocumentsStore,
  useDownloadFileById,
} from "@/entities/documents";

import { getOcredFile } from "../api/services";

export const useDownloadOcred = () => {
  const documentId = useDocumentsStore.use.documentId();
  const downloadFileById = useDownloadFileById();
  const onDownloadStartedRef = useRef<(() => void) | null>(null);

  const { startWaitingSSEEvent, isLoading } = useSSEWithPollingFallback({
    sseEvent: ESSEventType.FILE_PROCESSING_RESULT,
    sseWaitTimeoutMs: 10_000,
    onSSEEvent: useEventCallback(async (data) => {
      if (data.data.processing_status === EProcessingStatus.FAILED) {
        openModal({
          type: EModalsTypes.FILE_UPLOAD_ERROR,
          options: { errorMessage: JSON.stringify(data) },
        });
        onDownloadStartedRef.current?.();

        return;
      }

      downloadFileById(data.data.id);
      onDownloadStartedRef.current?.();
    }),
    poller: useEventCallback(async () => {
      if (!documentId) {
        throw new Error("Document ID is not set");
      }

      const ocred = await getOcredFile({ fileId: documentId });
      if (ocred.processing_status === EProcessingStatus.FAILED) {
        openModal({
          type: EModalsTypes.FILE_UPLOAD_ERROR,
          options: { errorMessage: JSON.stringify(ocred) },
        });
        onDownloadStartedRef.current?.();

        return;
      }

      downloadFileById(ocred.id);
      onDownloadStartedRef.current?.();
    }),
    pollingOptions: {
      intervalMs: 5_000,
      stopTimeoutMs: 30_000,
      onTimedOut: () => {
        openModal({
          type: EModalsTypes.FILE_UPLOAD_ERROR,
          options: { errorMessage: "timeout waiting" },
        });
        onDownloadStartedRef.current?.();
      },
    },
  });

  const downloadOcred = useEventCallback((onDownloadStarted?: () => void) => {
    onDownloadStartedRef.current = onDownloadStarted ?? null;
    startWaitingSSEEvent();
  });

  return { downloadOcred, isLoading };
};
