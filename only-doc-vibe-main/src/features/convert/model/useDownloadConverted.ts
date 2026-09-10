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

import { getConvertedFile } from "../api/services";

export const useDownloadConverted = () => {
  const documentId = useDocumentsStore.use.documentId();
  const downloadFileById = useDownloadFileById();
  const onDownloadStartedRef = useRef<(() => void) | null>(null);
  const filenameOverrideRef = useRef<string | undefined>(undefined);

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

      if (data.data.processing_status !== EProcessingStatus.READY) {
        return;
      }

      const isDownloaded = await downloadFileById(
        data.data.id,
        filenameOverrideRef.current
      );
      if (!isDownloaded) {
        openModal({
          type: EModalsTypes.FILE_UPLOAD_ERROR,
          options: { errorMessage: "download failed" },
        });
      }

      onDownloadStartedRef.current?.();
    }),
    poller: useEventCallback(async () => {
      if (!documentId) {
        throw new Error("Document ID is not set");
      }

      const converted = await getConvertedFile({ fileId: documentId });
      if (converted.processing_status === EProcessingStatus.FAILED) {
        openModal({
          type: EModalsTypes.FILE_UPLOAD_ERROR,
          options: { errorMessage: JSON.stringify(converted) },
        });
        onDownloadStartedRef.current?.();

        return;
      }

      if (converted.processing_status !== EProcessingStatus.READY) {
        throw new Error("Converted file is not ready yet");
      }

      const isDownloaded = await downloadFileById(
        converted.id,
        filenameOverrideRef.current
      );
      if (!isDownloaded) {
        openModal({
          type: EModalsTypes.FILE_UPLOAD_ERROR,
          options: { errorMessage: "download failed" },
        });
      }

      onDownloadStartedRef.current?.();
    }),
    pollingOptions: {
      intervalMs: 5_000,
      stopTimeoutMs: 180_000,
      onTimedOut: () => {
        openModal({
          type: EModalsTypes.FILE_UPLOAD_ERROR,
          options: { errorMessage: "timeout waiting" },
        });
        onDownloadStartedRef.current?.();
      },
    },
  });

  const downloadConverted = useEventCallback(
    (onDownloadStarted?: () => void, filenameOverride?: string) => {
      onDownloadStartedRef.current = onDownloadStarted ?? null;
      filenameOverrideRef.current = filenameOverride;
      startWaitingSSEEvent();
    }
  );

  return { downloadConverted, isLoading };
};
