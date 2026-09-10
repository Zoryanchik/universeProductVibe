import useEventCallback from "@/shared/lib/state/useEventCallback";
import type { InternalFileType } from "@/shared/constants/file-type";

import { uploadFileToConvert } from "./services";

export const useUploadFileToConvert = () => {
  return useEventCallback(
    async ({
      file,
      uploadUrl,
      pagesCount,
      from,
      to,
    }: {
      file: File;
      uploadUrl: string;
      pagesCount: number;
      from: InternalFileType;
      to: InternalFileType;
    }) => {
      try {
        const document = await uploadFileToConvert({
          url: uploadUrl,
          file,
          pagesCount,
          from,
          to,
        });

        return document;
      } catch {
        // was analytic error handling

        return null;
      }
    }
  );
};
