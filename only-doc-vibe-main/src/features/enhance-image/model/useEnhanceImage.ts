import { useCallback, useRef } from "react";

import { trackFileUploadStatus } from "@/shared/lib/analytics";
import { getFIleTypeFromFilename } from "@/shared/lib/documents/getFileTypeFromFilename";
import { downloadByUrl } from "@/shared/lib/documents/downloadByUrl";
import {
  closeModal,
  openModal,
  updateCurrentModalOptions,
} from "@/shared/lib/modals/modals-store";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import type { InternalFileType } from "@/shared/constants/file-type";
import { finishProgressModal } from "@/shared/lib/modals/finishProgressModal";
import { logger } from "@/shared/lib/utils/logger";

import {
  uploadFileToBucket,
  useGetUploadLink,
  startDocumentFlow,
  type EFunnels,
  type EServiceType,
} from "@/entities/documents";

import { useUploadFileToEnhanceImage } from "../api/api-hooks";
import { getImageDimensions } from "../lib/getImageDimensions";
import type { EnhanceLevel } from "../ui/EnhanceImagePreviewContent";

const DEFAULT_LEVEL: EnhanceLevel = 2;

interface IEnhanceContext {
  file: File;
  uploadUrl: string;
}

export const useEnhanceImage = ({
  funnel,
  serviceType,
  acceptedFormats,
}: {
  funnel: EFunnels;
  serviceType: EServiceType;
  acceptedFormats: InternalFileType[];
}) => {
  const getUploadLink = useGetUploadLink();
  const uploadFileToEnhanceImage = useUploadFileToEnhanceImage();

  const contextRef = useRef<IEnhanceContext | null>(null);

  const enhanceAtLevel = useCallback(
    async (level: EnhanceLevel) => {
      const context = contextRef.current;
      if (!context) return;

      updateCurrentModalOptions(EModalsTypes.ENHANCE_IMAGE_MODAL, {
        level,
        isEnhancing: true,
      });

      const result = await uploadFileToEnhanceImage({
        uploadUrl: context.uploadUrl,
        file: context.file,
        level,
      });

      if (!result?.document) {
        logger.error("[ Enhance ] Level switch failed", { level });
        updateCurrentModalOptions(EModalsTypes.ENHANCE_IMAGE_MODAL, {
          isEnhancing: false,
        });

        return;
      }

      updateCurrentModalOptions(EModalsTypes.ENHANCE_IMAGE_MODAL, {
        enhancedImageUrl: result.document.url,
        isEnhancing: false,
      });
    },
    [uploadFileToEnhanceImage]
  );

  const processEnhance = useCallback(
    async (file: File) => {
      const formatFrom = getFIleTypeFromFilename(file.name);
      if (!formatFrom) return;

      logger.log(`[ Enhance ] Started: ${file.name}, funnel: ${funnel}`);

      openModal({
        type: EModalsTypes.WATERMARK_REMOVING,
        options: {
          downloadProgress: 0,
          durationSeconds: 5,
          filename: file.name,
        },
      });

      try {
        const uploadLink = await getUploadLink(file.name);
        if (!uploadLink) {
          throw new Error("Upload link not found");
        }

        await uploadFileToBucket({ url: uploadLink.url, file });

        const [dimensions, result] = await Promise.all([
          getImageDimensions(file),
          uploadFileToEnhanceImage({
            uploadUrl: uploadLink.url,
            file,
            level: DEFAULT_LEVEL,
          }),
        ]);

        if (!result?.document) {
          throw new Error("Processing failed");
        }

        contextRef.current = { file, uploadUrl: uploadLink.url };

        startDocumentFlow({
          file,
          funnel,
          service: serviceType,
          formatTo: formatFrom,
        });

        await finishProgressModal(EModalsTypes.WATERMARK_REMOVING);
        closeModal(EModalsTypes.WATERMARK_REMOVING);

        openModal({
          type: EModalsTypes.ENHANCE_IMAGE_MODAL,
          options: {
            originalImageUrl: result.originalFileUrl,
            enhancedImageUrl: result.document.url,
            filename: file.name,
            originalWidth: dimensions.width,
            originalHeight: dimensions.height,
            level: DEFAULT_LEVEL,
            isEnhancing: false,
            acceptFormats: acceptedFormats,
            onSelectLevel: (nextLevel) => {
              void enhanceAtLevel(nextLevel);
            },
            onDownload: (url) => {
              downloadByUrl({ url, filename: `enhanced_${file.name}` });
            },
            handleUploadFile: (nextFile) => {
              void processEnhance(nextFile);
            },
          },
        });
      } catch (error) {
        logger.error("[ Enhance ] Failed", error);
        trackFileUploadStatus({
          file,
          status: "error",
          errorCode: "enhance_image_failed",
        });
        closeModal(EModalsTypes.WATERMARK_REMOVING);
        openModal({ type: EModalsTypes.FILE_UPLOAD_ERROR });
      }
    },
    [
      acceptedFormats,
      enhanceAtLevel,
      funnel,
      getUploadLink,
      serviceType,
      uploadFileToEnhanceImage,
    ]
  );

  return useCallback(
    async (param: File | FileList) => {
      const file = param instanceof File ? param : param[0];
      if (!file) return;

      void processEnhance(file);
    },
    [processEnhance]
  );
};
