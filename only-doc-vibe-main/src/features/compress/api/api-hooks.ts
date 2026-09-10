import useEventCallback from "@/shared/lib/state/useEventCallback";

import { uploadFileToCompress } from "./services";
import type { ECompressionLevel } from "../model/constants/compression-level";

export const useUploadFileToCompress = () => {
  return useEventCallback(
    async ({
      file,
      uploadUrl,
      pagesCount,
      compressLevel,
    }: {
      file: File;
      uploadUrl: string;
      pagesCount: number;
      compressLevel: ECompressionLevel;
    }) => {
      try {
        const document = await uploadFileToCompress({
          url: uploadUrl,
          file,
          pagesCount,
          compressLevel,
        });

        return document;
      } catch {
        // was analytic error handling

        return null;
      }
    }
  );
};
