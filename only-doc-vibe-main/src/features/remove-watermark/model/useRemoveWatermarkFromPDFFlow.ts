import { useCallback } from "react";

import type { InternalFileType } from "@/shared/constants/file-type";
import { trackFileUploadStatus } from "@/shared/lib/analytics";
import { openModal, closeModal } from "@/shared/lib/modals/modals-store";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import { downloadByUrl } from "@/shared/lib/documents/downloadByUrl";

import {
  startDocumentFlow,
  type EFunnels,
  type EServiceType,
} from "@/entities/documents";

import { useRemoveWatermarkFromPDFBE } from "./useRemoveWatermarkFromPdfBE";

export const useRemoveWatermarkFromPDFFlow = ({
  funnel,
  serviceType,
  formatTo,
}: {
  funnel: EFunnels;
  serviceType: EServiceType;
  formatTo: InternalFileType;
}) => {
  const removeWatermarkFromPDF = useRemoveWatermarkFromPDFBE();

  const processRemoveWatermark = useCallback(
    async ({ file, texts }: { file: File; texts: string[] }) => {
      openModal({
        type: EModalsTypes.WATERMARK_REMOVING,
        options: {
          downloadProgress: 0,
          durationSeconds: 4,
        },
      });

      try {
        const { document } = await removeWatermarkFromPDF({ file, texts });

        startDocumentFlow({
          file,
          funnel,
          service: serviceType,
          formatTo,
        });

        downloadByUrl({
          url: document.url,
          filename: `removed_watermark_${file.name}`,
        });

        closeModal(EModalsTypes.WATERMARK_REMOVING);
      } catch {
        trackFileUploadStatus({
          file,
          status: "error",
          errorCode: "remove_watermark_pdf_failed",
        });
        closeModal(EModalsTypes.WATERMARK_REMOVING);
        openModal({ type: EModalsTypes.FILE_UPLOAD_ERROR });
      }
    },
    [funnel, serviceType, formatTo, removeWatermarkFromPDF]
  );

  return useCallback(
    async (param: File | FileList) => {
      const file = param instanceof File ? param : param[0];

      if (!file) return;

      openModal({
        type: EModalsTypes.REMOVE_PDF_WATERMARK_MODAL,
        options: {
          filename: file.name,
          onSubmit: (texts: string[]) => {
            void processRemoveWatermark({ file, texts });
          },
        },
      });
    },
    [processRemoveWatermark]
  );
};
