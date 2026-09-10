import useEventCallback from "@/shared/lib/state/useEventCallback";

import type { IRequiresPaymentResponse } from "@/entities/documents";

import { uploadFileToTranslate, type ITranslateResponse } from "./services";

export const useUploadFileToTranslate = () => {
  return useEventCallback(
    async ({
      file,
      uploadUrl,
      pagesCount,
      sourceLanguageCode,
      targetLanguageCode,
    }: {
      file: File;
      uploadUrl: string;
      pagesCount: number;
      sourceLanguageCode: string;
      targetLanguageCode: string;
    }): Promise<ITranslateResponse | IRequiresPaymentResponse | null> => {
      try {
        const document = await uploadFileToTranslate({
          url: uploadUrl,
          file,
          pagesCount,
          sourceLanguageCode,
          targetLanguageCode,
        });

        return document;
      } catch {
        // was analytic error handling
        return null;
      }
    }
  );
};
