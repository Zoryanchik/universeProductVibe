import { useCallback, useRef } from "react";

import { trackFileUploadStatus } from "@/shared/lib/analytics";
import { getFileKeyFromAWSLink } from "@/shared/lib/documents/getFileKeyFromAWSLink";
import { closeModal, openModal } from "@/shared/lib/modals/modals-store";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import { InternalFileType } from "@/shared/constants/file-type";
import { wait } from "@/shared/lib/utils/wait";
import { useEventBusSubscription } from "@/shared/lib/state/useEventBusSubscription";
import { SSEEventBus } from "@/shared/api/sse/sseEventBus";
import { ESSEventType } from "@/shared/api/sse/sse-event-type";
import { downloadByUrl } from "@/shared/lib/documents/downloadByUrl";
import { getFIleTypeFromFilename } from "@/shared/lib/documents/getFileTypeFromFilename";
import { finishProgressModal } from "@/shared/lib/modals/finishProgressModal";

import {
  ECreationTypes,
  setDocumentId,
  setFileKey,
  setInitialPagesCount,
  setOriginalFileUrl,
  setPreviewUrl,
  setResultFileUrl,
  setUploadUrl,
  setUrlExpiresAt,
  startDocumentFlow,
  uploadFileToBucket,
  useGetUploadLink,
  type EFunnels,
  type EServiceType,
} from "@/entities/documents";

import { useUploadFileToRemoveWatermark } from "../api/api-hooks";

export const useRemoveWatermarkFromImage = ({
  funnel,
  serviceType,
}: {
  funnel: EFunnels;
  serviceType: EServiceType;
}) => {
  const getUploadLink = useGetUploadLink();
  const uploadFileToRemoveImageWatermark = useUploadFileToRemoveWatermark();

  const documentIdRef = useRef<string | null>(null);

  const uploadFile = useCallback(
    async ({ file, texts }: { file: File; texts: string[] }) => {
      const uploadLink = await getUploadLink(file.name);

      if (!uploadLink) {
        throw new Error("Upload link not found");
      }

      await uploadFileToBucket({ url: uploadLink.url, file });

      const result = await uploadFileToRemoveImageWatermark({
        uploadUrl: uploadLink.url,
        file,
        text: texts,
      });

      if (!result || !result.document || !result.originalFileUrl) {
        throw new Error("Document not found");
      }

      return {
        ...result,
        uploadLink,
      };
    },
    [getUploadLink, uploadFileToRemoveImageWatermark]
  );

  const processRemoveWatermark = useCallback(
    async ({ file, texts }: { file: File; texts: string[] }) => {
      const formatFrom = getFIleTypeFromFilename(file.name);

      openModal({
        type: EModalsTypes.WATERMARK_REMOVING,
        options: {
          downloadProgress: 0,
          durationSeconds: 5,
        },
      });

      try {
        const [{ document, originalFileUrl, uploadLink }] = await Promise.all([
          uploadFile({ file, texts }),
          wait(5_000),
        ]);

        startDocumentFlow({
          file,
          funnel,
          service: serviceType,
          formatTo: formatFrom!,
        });
        setOriginalFileUrl(originalFileUrl);
        setUrlExpiresAt(uploadLink.expiredAt);
        setUploadUrl(uploadLink.url);
        setResultFileUrl(document.url);
        setFileKey(getFileKeyFromAWSLink(uploadLink.url));
        setPreviewUrl(document.url);
        setInitialPagesCount(1);
        // start funnel clears document id and we need to reset it in case sse already worked
        if (documentIdRef.current) {
          setDocumentId(documentIdRef.current);
          documentIdRef.current = null;
        }

        await finishProgressModal(EModalsTypes.WATERMARK_REMOVING);
        closeModal(EModalsTypes.WATERMARK_REMOVING);
        openModal({
          type: EModalsTypes.REMOVE_IMAGE_WATERMARK_MODAL,
          options: {
            originalImageUrl: originalFileUrl,
            removedWatermarkImageUrl: document.url,
            acceptFormats: [
              InternalFileType.JPG,
              InternalFileType.JPEG,
              InternalFileType.PNG,
            ],
            handleUploadFile: (nextFile) => {
              void processRemoveWatermark({ file: nextFile, texts: [] });
            },
            onDownload: () => {
              downloadByUrl({
                url: document.url,
                filename: `removed_watermark_${file.name}`,
              });
            },
          },
        });
      } catch {
        trackFileUploadStatus({
          file,
          status: "error",
          errorCode: "remove_watermark_image_failed",
        });
        closeModal(EModalsTypes.WATERMARK_REMOVING);
        openModal({ type: EModalsTypes.FILE_UPLOAD_ERROR });
      }
    },
    [funnel, serviceType, uploadFile]
  );

  const handleUploadFile = useCallback(
    async (param: File | FileList) => {
      const file = param instanceof File ? param : param[0];
      if (!file) return;

      void processRemoveWatermark({ file, texts: [] });
    },
    [processRemoveWatermark]
  );

  useEventBusSubscription(
    SSEEventBus,
    ESSEventType.FILE_PROCESSING_RESULT,
    (message) => {
      if (message?.data?.creation_type !== ECreationTypes.REMOVE_WATERMARK) {
        return;
      }

      documentIdRef.current = message.data.id;
      setDocumentId(message.data.id);
    }
  );

  useEventBusSubscription(
    SSEEventBus,
    ESSEventType.FILE_PROCESSING_ERROR,
    () => {
      // was analytic error handling
    }
  );

  return handleUploadFile;
};
