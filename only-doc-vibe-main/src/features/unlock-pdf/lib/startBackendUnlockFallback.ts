import { InternalFileType } from "@/shared/constants/file-type";
import { getFileKeyFromAWSLink } from "@/shared/lib/documents/getFileKeyFromAWSLink";
import { logger } from "@/shared/lib/utils/logger";

import {
  getUploadLink,
  setDocumentId,
  setFileKey,
  setUploadUrl,
  setUrlExpiresAt,
  startDocumentFlow,
  type EFunnels,
  type EServiceType,
  type IUploadLink,
} from "@/entities/documents";

import { uploadFileToUnlock } from "../api/services";

interface StartBackendUnlockFallbackParams {
  file: File;
  funnel: EFunnels;
  serviceType: EServiceType;
}

export const startBackendUnlockFallback = async ({
  file,
  funnel,
  serviceType,
}: StartBackendUnlockFallbackParams): Promise<string | null> => {
  try {
    const uploadLink = (await getUploadLink<string>(
      file.name
    )) as IUploadLink | null;

    if (!uploadLink) {
      throw new Error("Upload link not found");
    }

    const unlockResponse = await uploadFileToUnlock({
      url: uploadLink.url,
      file,
    });

    if (
      !unlockResponse ||
      !("success" in unlockResponse) ||
      !unlockResponse.success ||
      !unlockResponse.fileId
    ) {
      return null;
    }

    const fileId = unlockResponse.fileId;

    setDocumentId(fileId);
    setUploadUrl(uploadLink.url);
    setFileKey(getFileKeyFromAWSLink(uploadLink.url));

    if (uploadLink.expiredAt) {
      setUrlExpiresAt(uploadLink.expiredAt);
    }

    await startDocumentFlow({
      file,
      funnel,
      service: serviceType,
      formatTo: InternalFileType.PDF,
    });

    return fileId;
  } catch (error) {
    logger.warn("[ Unlock ] Backend unlock fallback failed", error);

    return null;
  }
};
