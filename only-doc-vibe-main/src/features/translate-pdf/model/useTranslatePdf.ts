import { useCallback } from "react";

import { InternalFileType } from "@/shared/constants/file-type";
import { ELanguages } from "@/shared/constants/languages";
import { openModal, closeModal } from "@/shared/lib/modals/modals-store";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import { wait } from "@/shared/lib/utils/wait";
import { countPdfPages } from "@/shared/lib/documents/countPdfPages";
import { getFIleTypeFromFilename } from "@/shared/lib/documents/getFileTypeFromFilename";
import { fileToBase64 } from "@/shared/lib/documents/fileToBase64";
import { detectPdfLanguage } from "@/shared/lib/documents/detectPdfLanguage";
import { logger } from "@/shared/lib/utils/logger";
import { getFileKeyFromAWSLink } from "@/shared/lib/documents/getFileKeyFromAWSLink";
import useEventCallback from "@/shared/lib/state/useEventCallback";

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

import { setSourceLanguage, setTargetLanguage } from "./translate-store";
import { useDownloadTranslated } from "./useDownloadTranslated";
import { useUploadFileToTranslate } from "../api/api-hooks";
import {
  francCodeToLanguage,
  detectBrowserLanguage,
} from "./constants/translate-languages";

export const useTranslatePdf = ({
  funnel,
  serviceType,
  formatTo,
}: {
  funnel: EFunnels;
  serviceType: EServiceType;
  formatTo: InternalFileType;
}) => {
  const { downloadTranslated } = useDownloadTranslated();
  const getUploadLink = useGetUploadLink();
  const uploadFileToTranslate = useUploadFileToTranslate();

  const uploadFile = useCallback(
    async ({
      file,
      pagesCount,
      sourceLanguageCode,
      targetLanguageCode,
    }: {
      file: File;
      pagesCount: number;
      sourceLanguageCode: string;
      targetLanguageCode: string;
    }) => {
      const uploadLink = await getUploadLink(file.name);

      if (!uploadLink) {
        throw new Error("Upload link not found");
      }

      const document = await uploadFileToTranslate({
        uploadUrl: uploadLink.url,
        file,
        pagesCount,
        sourceLanguageCode,
        targetLanguageCode,
      });

      if (!document) {
        throw new Error("Document not found");
      }

      return { document, uploadLink };
    },
    [getUploadLink, uploadFileToTranslate]
  );

  const onLanguagesSelected = useEventCallback(
    async ({
      file,
      sourceLanguage,
      targetLanguage,
    }: {
      file: File;
      sourceLanguage: ELanguages;
      targetLanguage: ELanguages;
    }) => {
      logger.log(
        `[ File Upload ] Translate started: ${file.name}, ${sourceLanguage} -> ${targetLanguage}, funnel: ${funnel}`
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
        const pagesCount = await countPdfPages(file);
        const [{ document, uploadLink }] = await Promise.all([
          uploadFile({
            file,
            pagesCount,
            sourceLanguageCode: sourceLanguage,
            targetLanguageCode: targetLanguage,
          }),
          wait(3_000),
        ]);

        startDocumentFlow({
          file,
          funnel,
          service: serviceType,
          formatTo,
        });

        setSourceLanguage(sourceLanguage);
        setTargetLanguage(targetLanguage);

        setDocumentId(document.fileId);
        setUrlExpiresAt(uploadLink.expiredAt);
        setUploadUrl(uploadLink.url);
        setFileKey(getFileKeyFromAWSLink(uploadLink.url));
        setInitialPagesCount(pagesCount);

        downloadTranslated(document.fileId, () => {
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

      if (formatFrom !== InternalFileType.PDF) return;

      // Detect source language from PDF content
      let detectedSource: ELanguages | null = null;
      try {
        const base64 = await fileToBase64(file);
        const francCode = await detectPdfLanguage(base64);
        detectedSource = francCodeToLanguage(francCode);
      } catch {
        // Detection failed, will default to English
      }

      // Auto-suggest target language from browser locale
      const browserLang = detectBrowserLanguage();
      let suggestedTarget: ELanguages | null = null;

      if (
        browserLang &&
        browserLang !== (detectedSource ?? ELanguages.ENGLISH)
      ) {
        // Suggest browser language as target if it differs from source
        suggestedTarget = browserLang;
      } else if (
        (detectedSource ?? ELanguages.ENGLISH) !== ELanguages.ENGLISH
      ) {
        suggestedTarget = ELanguages.ENGLISH;
      }

      openModal({
        type: EModalsTypes.SELECT_TRANSLATE_LANGUAGE,
        options: {
          detectedSourceLanguage: detectedSource,
          suggestedTargetLanguage: suggestedTarget,
          onSubmit: ({
            sourceLanguage,
            targetLanguage,
          }: {
            sourceLanguage: ELanguages;
            targetLanguage: ELanguages;
          }) => {
            onLanguagesSelected({
              file,
              sourceLanguage,
              targetLanguage,
            });
          },
        },
      });
    },
    [onLanguagesSelected]
  );
};
