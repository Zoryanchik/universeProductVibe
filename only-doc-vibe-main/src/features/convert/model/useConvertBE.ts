import { useCallback } from "react";

import {
  InternalFileType,
  isImageFileType,
} from "@/shared/constants/file-type";
import { trackFileUploadStatus } from "@/shared/lib/analytics";
import { countPdfPages } from "@/shared/lib/documents/countPdfPages";
import { getFileKeyFromAWSLink } from "@/shared/lib/documents/getFileKeyFromAWSLink";
import { getFileNameWithoutFormat } from "@/shared/lib/documents/getFilenameWithoutFormat";
import { openModal, closeModal } from "@/shared/lib/modals/modals-store";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import { getFIleTypeFromFilename } from "@/shared/lib/documents/getFileTypeFromFilename";
import { wait } from "@/shared/lib/utils/wait";

import {
  setDocumentId,
  setFileKey,
  setInitialPagesCount,
  setUploadUrl,
  setUrlExpiresAt,
  startDocumentFlow,
  useGetUploadLink,
  type EFunnels,
  type EServiceType,
} from "@/entities/documents";

import { useDownloadConverted } from "./useDownloadConverted";
import { useUploadFileToConvert } from "../api/api-hooks";

export const useConvertBE = ({
  funnel,
  serviceType,
}: {
  funnel: EFunnels;
  serviceType: EServiceType;
}) => {
  const { downloadConverted } = useDownloadConverted();
  const getUploadLink = useGetUploadLink();
  const uploadFileToConvert = useUploadFileToConvert();

  const uploadFile = useCallback(
    async ({
      file,
      formatFrom,
      formatTo,
      pagesCount,
    }: {
      file: File;
      formatFrom: InternalFileType;
      formatTo: InternalFileType;
      pagesCount: number;
    }) => {
      const uploadLink = await getUploadLink(file.name);

      if (!uploadLink) {
        throw new Error("Upload link not found");
      }

      const document = await uploadFileToConvert({
        uploadUrl: uploadLink.url,
        file,
        pagesCount,
        from: formatFrom,
        to: formatTo,
      });

      if (!document) {
        throw new Error("Document not found");
      }

      return { document, uploadLink };
    },
    [getUploadLink, uploadFileToConvert]
  );

  return useCallback(
    async (
      param: File | FileList,
      formatTo: InternalFileType,
      outputFilename?: string
    ) => {
      const file = param instanceof File ? param : param[0];
      const formatFrom = getFIleTypeFromFilename(file.name);

      if (!file || !formatFrom) return;

      openModal({
        type: EModalsTypes.EDIT_UPLOADING,
        options: {
          downloadProgress: 0,
          durationSeconds: 3,
          filename: file.name,
        },
      });

      try {
        const pagesCount =
          formatFrom === InternalFileType.PDF
            ? Math.max(await countPdfPages(file), 1)
            : 1;

        const [{ document, uploadLink }] = await Promise.all([
          uploadFile({ file, formatFrom, formatTo, pagesCount }),
          wait(3_000),
        ]);

        startDocumentFlow({
          file,
          funnel,
          service: serviceType,
          formatTo,
        });
        setDocumentId("id" in document ? document.id : document.fileId);
        setUrlExpiresAt(uploadLink.expiredAt);
        setUploadUrl(uploadLink.url);
        setFileKey(getFileKeyFromAWSLink(uploadLink.url));
        setInitialPagesCount(pagesCount);

        const isMultiPagePdfToImage =
          formatFrom === InternalFileType.PDF &&
          isImageFileType(formatTo) &&
          pagesCount > 1;

        const baseName = outputFilename || getFileNameWithoutFormat(file.name);
        const outputExtension = isMultiPagePdfToImage
          ? "zip"
          : formatTo.toLowerCase();

        const filenameOverride =
          outputFilename || isMultiPagePdfToImage
            ? `${baseName}.${outputExtension}`
            : undefined;

        downloadConverted(() => {
          closeModal(EModalsTypes.EDIT_UPLOADING);
        }, filenameOverride);
      } catch {
        trackFileUploadStatus({
          file,
          status: "error",
          errorCode: "convert_upload_failed",
        });
        closeModal(EModalsTypes.EDIT_UPLOADING);
      }
    },
    [funnel, serviceType, downloadConverted, uploadFile]
  );
};
