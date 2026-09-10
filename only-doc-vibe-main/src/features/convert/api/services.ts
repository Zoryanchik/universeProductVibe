import { isAxiosError } from "axios";

import { apiHttpClient } from "@/shared/api/api-http-client";
import { API_ROUTES } from "@/shared/api/api-routes";
import { getFileKeyFromAWSLink } from "@/shared/lib/documents/getFileKeyFromAWSLink";
import { logger } from "@/shared/lib/utils/logger";
import type { InternalFileType } from "@/shared/constants/file-type";

import {
  uploadFileToBucket,
  type IDocument,
  type IRequiresPaymentResponse,
} from "@/entities/documents";

export const uploadFileToConvert = async ({
  url,
  file,
  pagesCount,
  from,
  to,
}: {
  url: string;
  file: File;
  pagesCount: number;
  from: InternalFileType;
  to: InternalFileType;
}): Promise<IDocument | IRequiresPaymentResponse | null> => {
  try {
    await uploadFileToBucket({ url, file });
    const fileKey = getFileKeyFromAWSLink(url);

    const dto = {
      filename: file.name,
      size: file.size,
      key: fileKey,
      pagesCount,
      from,
      to,
    };

    const documentResponse = await apiHttpClient.post<IDocument>(
      API_ROUTES.CONVERT_FILE_UPLOAD,
      dto
    );

    return documentResponse.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 402) {
      return error.response.data as IRequiresPaymentResponse;
    }

    logger.error("Error converting file", error);

    return null;
  }
};

export const getConvertedFile = async ({ fileId }: { fileId: string }) => {
  const response = await apiHttpClient.post<IDocument>(
    API_ROUTES.FILE_CONVERTED(fileId)
  );

  return response.data;
};
