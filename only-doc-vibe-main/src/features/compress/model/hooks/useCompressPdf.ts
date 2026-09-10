import { useCallback } from "react";

import { InternalFileType } from "@/shared/constants/file-type";
import { openModal, closeModal } from "@/shared/lib/modals/modals-store";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import { getFIleTypeFromFilename } from "@/shared/lib/documents/getFileTypeFromFilename";
import useEventCallback from "@/shared/lib/state/useEventCallback";
import { wait } from "@/shared/lib/utils/wait";
import { countPdfPages } from "@/shared/lib/documents/countPdfPages";
import { logger } from "@/shared/lib/utils/logger";
import { getFileKeyFromAWSLink } from "@/shared/lib/documents/getFileKeyFromAWSLink";

import {
  setInitialPagesCount,
  setDocumentId,
  setFileKey,
  setUploadUrl,
  setUrlExpiresAt,
  startDocumentFlow,
  useGetUploadLink,
  type EFunnels,
  type EServiceType,
} from "@/entities/documents";

import type { ECompressionLevel } from "../constants/compression-level";
import {
  formatOriginalSize,
  getCompressedSize,
} from "../../lib/getCompressedSize";
import { setCompressionData } from "../store/compress-store";
import { useUploadFileToCompress } from "../../api/api-hooks";
import { useDownloadCompressed } from "./useDownloadCompressed";

export const useCompressPdf = ({
  funnel,
  serviceType,
}: {
  funnel: EFunnels;
  serviceType: EServiceType;
}) => {
  const { downloadCompressed } = useDownloadCompressed();
  const getUploadLink = useGetUploadLink();
  const uploadFileToCompress = useUploadFileToCompress();

  const uploadFile = useCallback(
    async ({
      file,
      pagesCount,
      compressLevel,
    }: {
      file: File;
      pagesCount: number;
      compressLevel: ECompressionLevel;
    }) => {
      const uploadLink = await getUploadLink(file.name);

      if (!uploadLink) {
        throw new Error("Upload link not found");
      }

      const document = await uploadFileToCompress({
        uploadUrl: uploadLink.url,
        file,
        pagesCount,
        compressLevel,
      });

      if (!document) {
        throw new Error("Document not found");
      }

      return { document, uploadLink };
    },
    [getUploadLink, uploadFileToCompress]
  );

  const onCompressionLevelSelected = useEventCallback(
    async ({
      file,
      formatFrom,
      compressLevel,
    }: {
      file: File;
      formatFrom: InternalFileType;
      compressLevel: ECompressionLevel;
    }) => {
      logger.log(
        `[ File Upload ] Compress started: ${file.name}, level: ${compressLevel}, funnel: ${funnel}`
      );

      openModal({
        type: EModalsTypes.EDIT_UPLOADING,
        options: {
          downloadProgress: 0,
          durationSeconds: 3,
          filename: file.name,
        },
      });

      const data = getCompressedSize(file.size, compressLevel);

      setCompressionData({
        compressionLevel: compressLevel,
        compressedPercentage: data.percentageDecrease,
        compressedSize: data.compressedSize,
        initialFileSizeText: formatOriginalSize(file.size),
        sizeUnit: data.sizeUnit,
      });

      try {
        const pagesCount =
          formatFrom === InternalFileType.PDF ? await countPdfPages(file) : 1;
        const [{ document, uploadLink }] = await Promise.all([
          uploadFile({ file, pagesCount, compressLevel }),
          wait(3000),
        ]);

        startDocumentFlow({
          file,
          funnel,
          service: serviceType,
          formatTo: formatFrom,
        });
        setDocumentId("id" in document ? document.id : document.fileId);
        setUrlExpiresAt(uploadLink.expiredAt);
        setUploadUrl(uploadLink.url);
        setFileKey(getFileKeyFromAWSLink(uploadLink.url));
        setInitialPagesCount(pagesCount);

        // Start download and close modal after download is triggered
        downloadCompressed(() => {
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

      openModal({
        type: EModalsTypes.SELECT_COMPRESSION_LEVEL,
        options: {
          filename: file.name,
          fileSize: file.size,
          isImage: false,
          onSubmit: (compressLevel: ECompressionLevel) => {
            onCompressionLevelSelected({
              file,
              formatFrom,
              compressLevel,
            });
          },
        },
      });
    },
    [onCompressionLevelSelected]
  );
};
