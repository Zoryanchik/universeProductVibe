import useEventCallback from "@/shared/lib/state/useEventCallback";
import { checkRecaptcha } from "@/shared/api/captcha";
import { downloadByUrl } from "@/shared/lib/documents/downloadByUrl";

import { useGetShouldUseGrepatchaForUpload } from "@/entities/user/@x/documents";

import { getDocumentById, getUploadLink, uploadFileToEdit } from "./services";
import type { IUploadLink } from "../model/types";

export const useGetUploadLink = () => {
  const getShouldUseCaptcha = useGetShouldUseGrepatchaForUpload();

  return useEventCallback(
    async <
      T extends string | string[],
      R = T extends string ? IUploadLink : IUploadLink[],
    >(
      filename: T
    ): Promise<R | null> => {
      let captchaToken: string | undefined = undefined;

      if (getShouldUseCaptcha()) {
        captchaToken = await checkRecaptcha().catch(() => "");
      }

      const result = await getUploadLink<T, R>(filename, { captchaToken });

      return result;
    }
  );
};

export const useUploadFileToEdit = () => {
  return useEventCallback(
    async ({
      file,
      uploadUrl,
      pagesCount,
    }: {
      file: File;
      uploadUrl: string;
      pagesCount: number;
    }) => {
      try {
        const document = await uploadFileToEdit({
          url: uploadUrl,
          file,
          pagesCount,
        });

        return document;
      } catch {
        // was analytic error handling

        return null;
      }
    }
  );
};

export const useDownloadFileById = () => {
  return useEventCallback(async (id: string, filenameOverride?: string) => {
    try {
      const document = await getDocumentById(id);

      downloadByUrl({
        url: document.url,
        filename: filenameOverride || document.filename,
      });

      return true;
    } catch {
      // was analytic error handling
      return false;
    }
  });
};
