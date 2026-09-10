import { isAxiosError } from "axios";

import { apiHttpClient } from "@/shared/api/api-http-client";
import { API_ROUTES } from "@/shared/api/api-routes";
import { getFileKeyFromAWSLink } from "@/shared/lib/documents/getFileKeyFromAWSLink";
import { logger } from "@/shared/lib/utils/logger";

import type { IRequiresPaymentResponse } from "@/entities/documents";
import { uploadFileToBucket } from "@/entities/documents";

interface IUnlockUploadResponse {
  success: boolean;
  fileId: string;
}

export const uploadFileToUnlock = async ({
  url,
  file,
}: {
  url: string;
  file: File;
}): Promise<IUnlockUploadResponse | IRequiresPaymentResponse | null> => {
  try {
    await uploadFileToBucket({ url, file });

    const dto = {
      filename: file.name,
      size: file.size,
      key: getFileKeyFromAWSLink(url),
    };

    const documentResponse = await apiHttpClient.post<IUnlockUploadResponse>(
      API_ROUTES.UNLOCK_FILE_UPLOAD,
      dto
    );

    return documentResponse.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 402) {
      return error.response.data as IRequiresPaymentResponse;
    }

    logger.error("Error unlocking file", error);

    return null;
  }
};
