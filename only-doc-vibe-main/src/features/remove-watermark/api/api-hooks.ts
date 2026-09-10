import useEventCallback from "@/shared/lib/state/useEventCallback";

import { uploadFileToRemoveWatermark } from "./services";

export const useUploadFileToRemoveWatermark = () => {
  return useEventCallback(
    async ({
      file,
      uploadUrl,
      text,
    }: {
      file: File;
      uploadUrl: string;
      text?: string[];
    }) => {
      try {
        const document = await uploadFileToRemoveWatermark({
          url: uploadUrl,
          file,
          text,
        });

        return document;
      } catch {
        // was analytic error handling

        return null;
      }
    }
  );
};
