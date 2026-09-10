import { useCallback } from "react";

import { fileToBase64 } from "@/shared/lib/documents/fileToBase64";
import { openModal, closeModal } from "@/shared/lib/modals/modals-store";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import { getFIleTypeFromFilename } from "@/shared/lib/documents/getFileTypeFromFilename";
import useEventCallback from "@/shared/lib/state/useEventCallback";
import { wait } from "@/shared/lib/utils/wait";
import { countPdfPages } from "@/shared/lib/documents/countPdfPages";
import { getFileNameWithoutFormat } from "@/shared/lib/documents/getFilenameWithoutFormat";
import { getFilenameExtensionFromFile } from "@/shared/lib/documents/getExtensionFromFileName";
import { InternalFileType } from "@/shared/constants/file-type";
import { getFileKeyFromAWSLink } from "@/shared/lib/documents/getFileKeyFromAWSLink";
import { logger } from "@/shared/lib/utils/logger";

import {
  setDocumentId,
  setFileKey,
  setInitialPagesCount,
  setPdfFileContent,
  setUploadUrl,
  setUrlExpiresAt,
  startDocumentFlow,
  useGetUploadLink,
  type EFunnels,
  type EServiceType,
} from "@/entities/documents";

import type { SupportedOcrExportFormat } from "./types";
import { OCR_EXPORT_FORMAT_TO_INTERNAL_FILE_TYPE_MAP } from "./constants/ocr-export-formats";
import { useDownloadOcred } from "./useDownloadOcred";
import { useUploadFileToOCR } from "../api/api-hooks";

export const useOcr = ({
  funnel,
  serviceType,
}: {
  funnel: EFunnels;
  serviceType: EServiceType;
}) => {
  const { downloadOcred } = useDownloadOcred();
  const uploadFileToOCR = useUploadFileToOCR();
  const getUploadLink = useGetUploadLink();

  const uploadFile = useCallback(
    async ({
      file,
      exportFormat,
    }: {
      file: File;
      exportFormat: SupportedOcrExportFormat;
    }) => {
      const uploadLink = await getUploadLink(file.name);

      if (!uploadLink) {
        throw new Error("Upload link not found");
      }

      const document = await uploadFileToOCR({
        uploadUrl: uploadLink.url,
        file,
        exportFormat,
      });

      if (!document) {
        throw new Error("Document not found");
      }

      return { document, uploadLink };
    },
    [getUploadLink, uploadFileToOCR]
  );

  const onOCRExportFormatSelected = useEventCallback(
    async ({
      file,
      exportFormat,
      filename,
      formatFrom,
    }: {
      file: File;
      exportFormat: SupportedOcrExportFormat;
      filename: string;
      formatFrom: InternalFileType;
    }) => {
      logger.log(
        `[ File Upload ] OCR started: ${filename}, export format: ${exportFormat}, funnel: ${funnel}`
      );

      openModal({
        type: EModalsTypes.EDIT_UPLOADING,
        options: {
          downloadProgress: 0,
          durationSeconds: 3,
          filename: file.name,
        },
      });

      try {
        const [base64, pagesCount, { document, uploadLink }] =
          await Promise.all([
            formatFrom === InternalFileType.PDF
              ? fileToBase64(file)
              : Promise.resolve(null),
            formatFrom === InternalFileType.PDF
              ? countPdfPages(file)
              : Promise.resolve(1),
            uploadFile({
              file,
              exportFormat,
            }),
            wait(3_000),
          ]);
        startDocumentFlow({
          filename,
          file,
          funnel,
          service: serviceType,
          formatTo: OCR_EXPORT_FORMAT_TO_INTERNAL_FILE_TYPE_MAP[exportFormat],
        });

        if (base64) {
          setPdfFileContent(base64);
        }

        setInitialPagesCount(pagesCount);
        setDocumentId(document.fileId);
        setUrlExpiresAt(uploadLink.expiredAt);
        setUploadUrl(uploadLink.url);
        setFileKey(getFileKeyFromAWSLink(uploadLink.url));

        // Start download and close modal after download is triggered
        downloadOcred(() => {
          closeModal(EModalsTypes.EDIT_UPLOADING);
        });
      } catch {
        closeModal(EModalsTypes.EDIT_UPLOADING);
        // was analytic error handling
      }
    }
  );

  return useCallback(
    async (param: File | FileList) => {
      const file = param instanceof File ? param : param[0];
      if (!file) return;

      const formatFrom = getFIleTypeFromFilename(file.name);
      if (!formatFrom) return;

      const extension = getFilenameExtensionFromFile(file.name);
      const filenameWithoutExtension = getFileNameWithoutFormat(file.name);

      openModal({
        type: EModalsTypes.SELECT_OCR_EXPORT_FORMAT,
        options: {
          filename: `${filenameWithoutExtension}.${extension}`,
          onSubmit: ({
            exportFormat,
            filename: editedFilename,
          }: {
            exportFormat: SupportedOcrExportFormat;
            filename: string;
          }) => {
            onOCRExportFormatSelected({
              file,
              formatFrom,
              exportFormat,
              filename: editedFilename,
            });
          },
        },
      });
    },
    [onOCRExportFormatSelected]
  );
};
