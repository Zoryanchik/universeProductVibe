import { useCallback } from "react";

import {
  InternalFileType,
  isImageFileType,
} from "@/shared/constants/file-type";
import { closeModal, openModal } from "@/shared/lib/modals/modals-store";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import { getFIleTypeFromFilename } from "@/shared/lib/documents/getFileTypeFromFilename";
import { convertImageToPdf } from "@/shared/lib/documents/convertImageToPdf";
import { wait } from "@/shared/lib/utils/wait";
import { finishProgressModal } from "@/shared/lib/modals/finishProgressModal";
import { downloadByUrl } from "@/shared/lib/documents/downloadByUrl";
import { getFileNameWithoutFormat } from "@/shared/lib/documents/getFilenameWithoutFormat";

export const useConvertFE = () => {
  const convertFile = useCallback(
    async ({
      file,
      formatFrom,
      formatTo,
    }: {
      readonly file: File;
      readonly formatFrom: InternalFileType;
      readonly formatTo: InternalFileType;
    }): Promise<File> => {
      // Image to PDF conversion
      if (isImageFileType(formatFrom) && formatTo === InternalFileType.PDF) {
        return convertImageToPdf(file);
      }

      // PDF passthrough (no conversion needed)
      if (formatFrom === InternalFileType.PDF) {
        return file;
      }

      throw new Error(`Unsupported FE conversion: ${formatFrom} → ${formatTo}`);
    },
    []
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
          durationSeconds: 2,
          filename: file.name,
        },
      });

      try {
        const [convertedFile] = await Promise.all([
          convertFile({ file, formatFrom, formatTo }),
          wait(2_000),
        ]);

        await finishProgressModal(EModalsTypes.EDIT_UPLOADING);

        // Create object URL and trigger download
        const objectUrl = URL.createObjectURL(convertedFile);
        const baseName = outputFilename || getFileNameWithoutFormat(file.name);
        const downloadFilename = `${baseName}.${formatTo.toLowerCase()}`;

        downloadByUrl({ url: objectUrl, filename: downloadFilename });

        // Clean up object URL after a short delay to ensure download starts
        setTimeout(() => {
          URL.revokeObjectURL(objectUrl);
        }, 1000);

        closeModal(EModalsTypes.EDIT_UPLOADING);
      } catch {
        closeModal(EModalsTypes.EDIT_UPLOADING);
      }
    },
    [convertFile]
  );
};
