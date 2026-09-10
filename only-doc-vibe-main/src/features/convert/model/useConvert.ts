import { useCallback } from "react";

import { getFIleTypeFromFilename } from "@/shared/lib/documents/getFileTypeFromFilename";
import { getFileNameWithoutFormat } from "@/shared/lib/documents/getFilenameWithoutFormat";
import {
  InternalFileType,
  isUnconvertibleOnFeFileType,
} from "@/shared/constants/file-type";
import { logger } from "@/shared/lib/utils/logger";
import { openModal, closeModal } from "@/shared/lib/modals/modals-store";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import { wait } from "@/shared/lib/utils/wait";
import { finishProgressModal } from "@/shared/lib/modals/finishProgressModal";

import type { EFunnels, EServiceType } from "@/entities/documents";

import { useConvertBE } from "./useConvertBE";
import { useConvertFE } from "./useConvertFE";

interface IUseConvertCoreParams {
  funnel: EFunnels;
  serviceType: EServiceType;
}

interface IUseConvertParams extends IUseConvertCoreParams {
  formatTo: InternalFileType;
}

/**
 * Low-level convert hook that routes between BE and FE conversion.
 * Does not show any modals — caller is responsible for UI flow.
 */
export const useConvertCore = ({
  funnel,
  serviceType,
}: IUseConvertCoreParams) => {
  const convertBE = useConvertBE({ funnel, serviceType });
  const convertFE = useConvertFE();

  return useCallback(
    (
      files: File | FileList,
      formatToParam: InternalFileType,
      outputFilename?: string
    ) => {
      const file = files instanceof File ? files : files[0];

      if (!file) return;

      const formatFrom = getFIleTypeFromFilename(file.name);
      const isUnconvertible = isUnconvertibleOnFeFileType(formatFrom);
      const isPdfToNonPdf =
        formatFrom === InternalFileType.PDF &&
        formatToParam !== InternalFileType.PDF;

      logger.log(
        `[ File Upload ] Convert started: ${file.name} (${formatFrom} → ${formatToParam}), funnel: ${funnel}`
      );

      if (isUnconvertible || isPdfToNonPdf) {
        logger.log(`[ File Upload ] Using BE conversion for: ${file.name}`);
        convertBE(file, formatToParam, outputFilename);

        return;
      }

      logger.log(`[ File Upload ] Using FE conversion for: ${file.name}`);
      convertFE(file, formatToParam, outputFilename);
    },
    [convertBE, convertFE, funnel]
  );
};

export const useConvert = ({
  funnel,
  serviceType,
  formatTo,
}: IUseConvertParams) => {
  const convertBE = useConvertBE({ funnel, serviceType });
  const convertFE = useConvertFE();

  const convert = useCallback(
    (
      files: File | FileList,
      formatToParam: InternalFileType,
      outputFilename?: string
    ) => {
      const file = files instanceof File ? files : files[0];

      if (!file) return;

      const formatFrom = getFIleTypeFromFilename(file.name);
      const isUnconvertible = isUnconvertibleOnFeFileType(formatFrom);
      const isPdfToNonPdf =
        formatFrom === InternalFileType.PDF &&
        formatToParam !== InternalFileType.PDF;

      logger.log(
        `[ File Upload ] Convert started: ${file.name} (${formatFrom} → ${formatToParam}), funnel: ${funnel}`
      );

      if (isUnconvertible || isPdfToNonPdf) {
        logger.log(`[ File Upload ] Using BE conversion for: ${file.name}`);
        convertBE(file, formatToParam, outputFilename);

        return;
      }

      logger.log(`[ File Upload ] Using FE conversion for: ${file.name}`);
      convertFE(file, formatToParam, outputFilename);
    },
    [convertBE, convertFE, funnel]
  );

  return useCallback(
    async (files: File | FileList) => {
      const file = files instanceof File ? files : files[0];

      if (!file) return;

      const formatFrom = getFIleTypeFromFilename(file.name);

      if (!formatFrom) return;

      const shouldShowFormatModal =
        formatFrom === InternalFileType.PDF ||
        formatTo === InternalFileType.PDF;

      // PDF sources or PDF targets need the format/name selection modal.
      if (shouldShowFormatModal) {
        openModal({
          type: EModalsTypes.EDIT_UPLOADING,
          options: {
            downloadProgress: 0,
            durationSeconds: 2,
            filename: file.name,
          },
        });

        await wait(1_500);
        await finishProgressModal(EModalsTypes.EDIT_UPLOADING);

        openModal({
          type: EModalsTypes.CHOOSE_FORMAT_PDF_CONVERTER_MODAL,
          options: {
            filename: getFileNameWithoutFormat(file.name),
            formatFrom,
            defaultFormatTo: formatTo,
            onSubmit: ({
              formatTo: selectedFormat,
              filename,
            }: {
              formatTo: InternalFileType;
              filename: string;
            }) => {
              closeModal(EModalsTypes.CHOOSE_FORMAT_PDF_CONVERTER_MODAL);
              convert(file, selectedFormat, filename);
            },
          },
        });

        return;
      }

      // Other conversions can run directly with the predetermined format.
      convert(files, formatTo);
    },
    [convert, formatTo]
  );
};
