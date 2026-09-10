import { useCallback } from "react";

import {
  type InternalFileType,
  isImageFileType,
} from "@/shared/constants/file-type";
import { logger } from "@/shared/lib/utils/logger";
import { getFIleTypeFromFilename } from "@/shared/lib/documents/getFileTypeFromFilename";

import type { EFunnels } from "@/entities/documents";
import type { EServiceType } from "@/entities/documents";

import { useRemoveWatermarkFromPDFFlow } from "./useRemoveWatermarkFromPDFFlow";
import { useRemoveWatermarkFromImage } from "./useRemoveWatermarkFromImage";

interface IUseRemoveWatermarkProps {
  funnel: EFunnels;
  serviceType: EServiceType;
  formatTo: InternalFileType;
}

export const useRemoveWatermark = ({
  funnel,
  serviceType,
  formatTo,
}: IUseRemoveWatermarkProps) => {
  const removePDFWatermark = useRemoveWatermarkFromPDFFlow({
    funnel,
    serviceType,
    formatTo,
  });
  const removeImageWatermark = useRemoveWatermarkFromImage({
    funnel,
    serviceType,
  });

  return useCallback(
    (param: File | FileList) => {
      const file = param instanceof File ? param : param[0];

      if (!file) return;

      const formatFrom = getFIleTypeFromFilename(file.name);

      logger.log(
        `[ File Upload ] Remove watermark started: ${file.name}, funnel: ${funnel}`
      );

      if (isImageFileType(formatFrom)) {
        removeImageWatermark(file);

        return;
      }

      removePDFWatermark(file);
    },
    [removePDFWatermark, removeImageWatermark, funnel]
  );
};
