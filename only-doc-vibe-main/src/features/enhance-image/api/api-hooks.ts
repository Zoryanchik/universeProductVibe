import useEventCallback from "@/shared/lib/state/useEventCallback";

import { uploadFileToEnhanceImage } from "./services";

export const useUploadFileToEnhanceImage = () => {
  return useEventCallback(
    async ({
      file,
      uploadUrl,
      level,
    }: {
      file: File;
      uploadUrl: string;
      level?: number;
    }) => {
      try {
        return await uploadFileToEnhanceImage({
          url: uploadUrl,
          file,
          level,
        });
      } catch {
        return null;
      }
    }
  );
};
