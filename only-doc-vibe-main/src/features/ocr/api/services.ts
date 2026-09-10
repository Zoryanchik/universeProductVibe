import { isAxiosError } from "axios";

import { apiHttpClient } from "@/shared/api/api-http-client";
import { API_ROUTES } from "@/shared/api/api-routes";
import { getFileKeyFromAWSLink } from "@/shared/lib/documents/getFileKeyFromAWSLink";
import { logger } from "@/shared/lib/utils/logger";

import {
  uploadFileToBucket,
  type IDocument,
  type IRequiresPaymentResponse,
} from "@/entities/documents";

import type { SupportedOcrExportFormat } from "../model/types";

interface IOcrUploadResponse {
  success: boolean;
  fileId: string;
}

export const uploadFileToOCR = async ({
  url,
  file,
  exportFormat,
}: {
  url: string;
  file: File;
  exportFormat: SupportedOcrExportFormat;
}): Promise<IOcrUploadResponse | IRequiresPaymentResponse | null> => {
  try {
    await uploadFileToBucket({ url, file });
    const fileKey = getFileKeyFromAWSLink(url);

    const dto = {
      filename: file.name,
      size: file.size,
      key: fileKey,
      exportFormat,
    };

    const documentResponse = await apiHttpClient.post<IOcrUploadResponse>(
      API_ROUTES.OCR_FILE_UPLOAD,
      dto
    );

    return documentResponse.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 402) {
      return error.response.data as IRequiresPaymentResponse;
    }

    logger.error("Error OCRing file", error);

    return null;
  }
};

export const getOcredFile = async ({ fileId }: { fileId: string }) => {
  const response = await apiHttpClient.post<IDocument>(
    API_ROUTES.FILE_OCRED(fileId)
  );

  return response.data;
};
