import { isAxiosError } from "axios";

import { apiHttpClient } from "@/shared/api/api-http-client";
import { API_ROUTES } from "@/shared/api/api-routes";
import { getFileKeyFromAWSLink } from "@/shared/lib/documents/getFileKeyFromAWSLink";
import { logger } from "@/shared/lib/utils/logger";

import {
  type IRequiresPaymentResponse,
  uploadFileToBucket,
} from "@/entities/documents";

export interface ITranslateResponse {
  success: boolean;
  fileId: string;
}

export const uploadFileToTranslate = async ({
  url,
  file,
  pagesCount,
  sourceLanguageCode,
  targetLanguageCode,
}: {
  url: string;
  file: File;
  pagesCount: number;
  sourceLanguageCode: string;
  targetLanguageCode: string;
}): Promise<ITranslateResponse | IRequiresPaymentResponse | null> => {
  try {
    await uploadFileToBucket({ url, file });
    const fileKey = getFileKeyFromAWSLink(url);

    const dto = {
      filename: file.name,
      size: file.size,
      key: fileKey,
      pagesCount,
      sourceLanguageCode,
      targetLanguageCode,
    };

    const documentResponse = await apiHttpClient.post<ITranslateResponse>(
      API_ROUTES.TRANSLATE_FILE_UPLOAD,
      dto
    );

    return documentResponse.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 402) {
      return error.response.data as IRequiresPaymentResponse;
    }

    logger.error("Error translating file", error);

    return null;
  }
};
