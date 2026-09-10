import { isAxiosError } from "axios";

import { apiHttpClient } from "@/shared/api/api-http-client";
import { API_ROUTES } from "@/shared/api/api-routes";
import { getFileKeyFromAWSLink } from "@/shared/lib/documents/getFileKeyFromAWSLink";
import { logger } from "@/shared/lib/utils/logger";

import type { IDocument, IRequiresPaymentResponse } from "@/entities/documents";
import { uploadFileToBucket } from "@/entities/documents";

import type { ECompressionLevel } from "../model/constants/compression-level";

export const uploadFileToCompress = async ({
  url,
  file,
  pagesCount,
  compressLevel,
}: {
  url: string;
  file: File;
  pagesCount: number;
  compressLevel: ECompressionLevel;
}): Promise<IDocument | IRequiresPaymentResponse | null> => {
  try {
    await uploadFileToBucket({ url, file });
    const fileKey = getFileKeyFromAWSLink(url);

    const dto = {
      filename: file.name,
      size: file.size,
      key: fileKey,
      pagesCount,
      compressLevel,
    };

    const documentResponse = await apiHttpClient.post<IDocument>(
      API_ROUTES.COMPRESS_FILE_UPLOAD,
      dto
    );

    return documentResponse.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 402) {
      return error.response.data as IRequiresPaymentResponse;
    }

    logger.error("Error compressing file", error);

    return null;
  }
};

export const getOptimizedFile = async ({ fileId }: { fileId: string }) => {
  const response = await apiHttpClient.post<IDocument>(
    API_ROUTES.FILE_OPTIMIZED(fileId)
  );

  return response.data;
};
