import useEventCallback from "@/shared/lib/state/useEventCallback";

import { uploadFileToOCR } from "./services";
import type { SupportedOcrExportFormat } from "../model/types";

export const useUploadFileToOCR = () => {
  return useEventCallback(
    async ({
      file,
      uploadUrl,
      exportFormat,
    }: {
      file: File;
      uploadUrl: string;
      exportFormat: SupportedOcrExportFormat;
    }) => {
      try {
        const document = await uploadFileToOCR({
          url: uploadUrl,
          file,
          exportFormat,
        });

        return document;
      } catch {
        // was analytic error handling

        return null;
      }
    }
  );
};
