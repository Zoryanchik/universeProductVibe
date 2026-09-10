import { apiHttpClient } from "@/shared/api/api-http-client";
import { API_ROUTES } from "@/shared/api/api-routes";
import { InternalFileType } from "@/shared/constants/file-type";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import { openModal, closeModal } from "@/shared/lib/modals/modals-store";
import { getFIleTypeFromFilename } from "@/shared/lib/documents/getFileTypeFromFilename";
import { getFileNameWithoutFormat } from "@/shared/lib/documents/getFilenameWithoutFormat";
import { getFileKeyFromAWSLink } from "@/shared/lib/documents/getFileKeyFromAWSLink";
import { logger } from "@/shared/lib/utils/logger";
import { wait } from "@/shared/lib/utils/wait";
import { ELanguages } from "@/shared/constants/languages";
import useEventCallback from "@/shared/lib/state/useEventCallback";

import {
  setDocumentId,
  setFileKey,
  setInitialPagesCount,
  setUploadUrl,
  startDocumentFlow,
  EFunnels,
  EServiceType,
  type IUserFile,
  type IDocument,
} from "@/entities/documents";

/* eslint-disable next-fsd/layer-imports */
import type { ECompressionLevel } from "@/features/compress";
import { formatOriginalSize, getCompressedSize } from "@/features/compress";
import { setCompressionData } from "@/features/compress";
import { useDownloadCompressed } from "@/features/compress";
import { useDownloadConverted } from "@/features/convert";
import { setSourceLanguage, setTargetLanguage } from "@/features/translate-pdf";
import { useDownloadTranslated } from "@/features/translate-pdf";
import { detectBrowserLanguage } from "@/features/translate-pdf";
/* eslint-enable next-fsd/layer-imports */

const FORMAT_STRING_TO_INTERNAL: Record<string, InternalFileType> = {
  PDF: InternalFileType.PDF,
  DOCX: InternalFileType.DOCX,
  XLSX: InternalFileType.XLSX,
  JPG: InternalFileType.JPG,
  PPTX: InternalFileType.PPTX,
  PNG: InternalFileType.PNG,
};

/**
 * POST directly to backend processing endpoints using the existing S3 key.
 * Skips the re-upload step since the file is already on S3.
 */
const submitExistingFileToConvert = async (
  userFile: IUserFile,
  formatTo: InternalFileType
): Promise<IDocument> => {
  const key = getFileKeyFromAWSLink(userFile.aws_url);
  const formatFrom = getFIleTypeFromFilename(userFile.filename);

  const { data } = await apiHttpClient.post<IDocument>(
    API_ROUTES.CONVERT_FILE_UPLOAD,
    {
      filename: userFile.filename,
      size: userFile.size,
      key,
      pagesCount: userFile.pages ?? 1,
      from: formatFrom,
      to: formatTo,
    }
  );

  return data;
};

const submitExistingFileToCompress = async (
  userFile: IUserFile,
  compressLevel: ECompressionLevel
): Promise<IDocument> => {
  const key = getFileKeyFromAWSLink(userFile.aws_url);

  const { data } = await apiHttpClient.post<IDocument>(
    API_ROUTES.COMPRESS_FILE_UPLOAD,
    {
      filename: userFile.filename,
      size: userFile.size,
      key,
      pagesCount: userFile.pages ?? 1,
      compressLevel,
    }
  );

  return data;
};

const submitExistingFileToTranslate = async (
  userFile: IUserFile,
  sourceLanguageCode: string,
  targetLanguageCode: string
): Promise<{ fileId: string }> => {
  const key = getFileKeyFromAWSLink(userFile.aws_url);

  const { data } = await apiHttpClient.post<{ fileId: string }>(
    API_ROUTES.TRANSLATE_FILE_UPLOAD,
    {
      filename: userFile.filename,
      size: userFile.size,
      key,
      pagesCount: userFile.pages ?? 1,
      sourceLanguageCode,
      targetLanguageCode,
    }
  );

  return data;
};

/**
 * Dashboard-specific tool actions that process files already on S3,
 * avoiding duplicate file creation by skipping the re-upload step.
 */
export const useDashboardToolActions = () => {
  const { downloadConverted } = useDownloadConverted();
  const { downloadCompressed } = useDownloadCompressed();
  const { downloadTranslated } = useDownloadTranslated();

  const handleConvertTo = useEventCallback(
    async (userFile: IUserFile, targetFormat?: string) => {
      const formatFrom = getFIleTypeFromFilename(userFile.filename);
      const preselected = targetFormat
        ? FORMAT_STRING_TO_INTERNAL[targetFormat]
        : undefined;

      const executeConvert = async (
        formatTo: InternalFileType,
        outputFilename?: string
      ) => {
        openModal({
          type: EModalsTypes.EDIT_UPLOADING,
          options: {
            downloadProgress: 0,
            durationSeconds: 3,
            filename: userFile.filename,
          },
        });

        try {
          const [document] = await Promise.all([
            submitExistingFileToConvert(userFile, formatTo),
            wait(3_000),
          ]);

          startDocumentFlow({
            file: new File([], userFile.filename),
            funnel: EFunnels.MAIN,
            service: EServiceType.CONVERTOR,
            formatTo,
          });
          setDocumentId(document.id);
          setUploadUrl(userFile.aws_url);
          setFileKey(getFileKeyFromAWSLink(userFile.aws_url));
          setInitialPagesCount(userFile.pages ?? 1);

          const filenameOverride = outputFilename
            ? `${outputFilename}.${formatTo.toLowerCase()}`
            : undefined;

          downloadConverted(() => {
            closeModal(EModalsTypes.EDIT_UPLOADING);
          }, filenameOverride);
        } catch (error) {
          closeModal(EModalsTypes.EDIT_UPLOADING);
          logger.error("Dashboard convert failed", error);
        }
      };

      if (formatFrom === InternalFileType.PDF) {
        const defaultFormatTo = preselected ?? InternalFileType.DOCX;

        openModal({
          type: EModalsTypes.CHOOSE_FORMAT_PDF_CONVERTER_MODAL,
          options: {
            filename: getFileNameWithoutFormat(userFile.filename),
            formatFrom,
            defaultFormatTo,
            onSubmit: ({
              formatTo: selectedFormat,
              filename,
            }: {
              formatTo: InternalFileType;
              filename: string;
            }) => {
              closeModal(EModalsTypes.CHOOSE_FORMAT_PDF_CONVERTER_MODAL);
              void executeConvert(selectedFormat, filename);
            },
          },
        });
      } else {
        const formatTo = preselected ?? InternalFileType.PDF;
        void executeConvert(formatTo);
      }
    }
  );

  const handleCompress = useEventCallback(async (userFile: IUserFile) => {
    const formatFrom = getFIleTypeFromFilename(userFile.filename);

    openModal({
      type: EModalsTypes.SELECT_COMPRESSION_LEVEL,
      options: {
        filename: userFile.filename,
        fileSize: userFile.size,
        isImage: false,
        onSubmit: async (compressLevel: ECompressionLevel) => {
          openModal({
            type: EModalsTypes.EDIT_UPLOADING,
            options: {
              downloadProgress: 0,
              durationSeconds: 3,
              filename: userFile.filename,
            },
          });

          const data = getCompressedSize(userFile.size, compressLevel);
          setCompressionData({
            compressionLevel: compressLevel,
            compressedPercentage: data.percentageDecrease,
            compressedSize: data.compressedSize,
            initialFileSizeText: formatOriginalSize(userFile.size),
            sizeUnit: data.sizeUnit,
          });

          try {
            const [document] = await Promise.all([
              submitExistingFileToCompress(userFile, compressLevel),
              wait(3_000),
            ]);

            startDocumentFlow({
              file: new File([], userFile.filename),
              funnel: EFunnels.COMPRESS_PDF,
              service: EServiceType.COMPRESSOR,
              formatTo: formatFrom ?? InternalFileType.PDF,
            });
            setDocumentId(document.id);
            setUploadUrl(userFile.aws_url);
            setFileKey(getFileKeyFromAWSLink(userFile.aws_url));
            setInitialPagesCount(userFile.pages ?? 1);

            downloadCompressed(() => {
              closeModal(EModalsTypes.EDIT_UPLOADING);
            });
          } catch (error) {
            closeModal(EModalsTypes.EDIT_UPLOADING);
            logger.error("Dashboard compress failed", error);
          }
        },
      },
    });
  });

  const handleTranslate = useEventCallback(async (userFile: IUserFile) => {
    const suggestedTarget = detectBrowserLanguage() ?? ELanguages.ENGLISH;

    openModal({
      type: EModalsTypes.SELECT_TRANSLATE_LANGUAGE,
      options: {
        detectedSourceLanguage: null,
        suggestedTargetLanguage:
          suggestedTarget !== ELanguages.ENGLISH ? suggestedTarget : null,
        onSubmit: async ({
          sourceLanguage,
          targetLanguage,
        }: {
          sourceLanguage: ELanguages;
          targetLanguage: ELanguages;
        }) => {
          openModal({
            type: EModalsTypes.EDIT_UPLOADING,
            options: {
              downloadProgress: 0,
              durationSeconds: 3,
              filename: userFile.filename,
            },
          });

          try {
            const [document] = await Promise.all([
              submitExistingFileToTranslate(
                userFile,
                sourceLanguage,
                targetLanguage
              ),
              wait(3_000),
            ]);

            startDocumentFlow({
              file: new File([], userFile.filename),
              funnel: EFunnels.TRANSLATE_PDF,
              service: EServiceType.TRANSLATE,
              formatTo: InternalFileType.PDF,
            });

            setSourceLanguage(sourceLanguage);
            setTargetLanguage(targetLanguage);
            setDocumentId(document.fileId);
            setUploadUrl(userFile.aws_url);
            setFileKey(getFileKeyFromAWSLink(userFile.aws_url));
            setInitialPagesCount(userFile.pages ?? 1);

            downloadTranslated(document.fileId, () => {
              closeModal(EModalsTypes.EDIT_UPLOADING);
            });
          } catch (error) {
            closeModal(EModalsTypes.EDIT_UPLOADING);
            logger.error("Dashboard translate failed", error);
          }
        },
      },
    });
  });

  return {
    handleConvertTo,
    handleCompress,
    handleTranslate,
  };
};
