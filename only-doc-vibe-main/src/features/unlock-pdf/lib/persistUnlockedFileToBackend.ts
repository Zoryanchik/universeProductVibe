import { getFileKeyFromAWSLink } from "@/shared/lib/documents/getFileKeyFromAWSLink";
import { logger } from "@/shared/lib/utils/logger";

import {
  getUploadLink,
  registerUploadedFile,
  uploadFileToBucket,
  type IUploadLink,
} from "@/entities/documents";

export const persistUnlockedFileToBackend = (file: File): void => {
  void (async () => {
    try {
      const link = (await getUploadLink<string>(
        file.name
      )) as IUploadLink | null;

      if (!link) {
        throw new Error("Upload link not found");
      }

      await uploadFileToBucket({ url: link.url, file });

      await registerUploadedFile({
        filename: file.name,
        size: file.size,
        key: getFileKeyFromAWSLink(link.url),
        pagesCount: null,
      });
    } catch (error) {
      logger.warn(
        "[persistUnlockedFileToBackend] Failed to persist decrypted file",
        error
      );
    }
  })();
};
