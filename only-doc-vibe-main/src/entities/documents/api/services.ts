import type { AxiosResponse } from "axios";

import { apiHttpClient } from "@/shared/api/api-http-client";
import { API_ROUTES } from "@/shared/api/api-routes";
import { logger } from "@/shared/lib/utils/logger";
import { getFileKeyFromAWSLink } from "@/shared/lib/documents/getFileKeyFromAWSLink";
import { blobToFile } from "@/shared/lib/documents/blobToFile";
import { ECaptchaAction } from "@/shared/api/captcha";

import type {
  IDocument,
  IDocumentById,
  IDocumentStatus,
  IUploadLink,
} from "../model/types";

export const getUploadLink = async <
  T extends string | string[],
  R = T extends string ? IUploadLink : IUploadLink[],
>(
  filename: T,
  { captchaToken }: { captchaToken?: string } = {}
): Promise<R | null> => {
  try {
    const response = await apiHttpClient.post<IUploadLink[]>(
      API_ROUTES.UPLOAD_LINK,
      {
        filenames: Array.isArray(filename) ? filename : [filename],
      },
      {
        params: {
          ...(captchaToken && {
            captcha_token: captchaToken,
            captcha_action: ECaptchaAction.USER_TENTH_FILE,
          }),
        },
      }
    );

    if (Array.isArray(filename)) {
      return response.data as R;
    }

    return response.data[0] as R;
  } catch {
    return null;
  }
};

export const getDocumentById = async (id: string): Promise<IDocumentById> => {
  const response = await apiHttpClient.get<IDocumentById>(
    API_ROUTES.FILE_DOWNLOAD(id)
  );

  return response.data;
};

export const getFileStatus = async (id: string): Promise<IDocumentStatus> => {
  const response = await apiHttpClient.get<IDocumentStatus>(
    API_ROUTES.FILE_STATUS(id)
  );

  return response.data;
};

export const uploadFileToEdit = async ({
  url,
  file,
  pagesCount,
}: {
  url: string;
  file: File;
  pagesCount: number;
}): Promise<IDocument | null> => {
  try {
    await uploadFileToBucket({ url, file });
    const fileKey = getFileKeyFromAWSLink(url);

    const dto = {
      filename: file.name,
      size: file.size,
      key: fileKey,
      pagesCount,
    };

    const documentResponse = await apiHttpClient.post<IDocument>(
      API_ROUTES.EDITOR_FILE_UPLOAD,
      dto
    );

    return documentResponse.data;
  } catch (error) {
    logger.error("Error uploading file to edit", error);

    return null;
  }
};

export const downloadLocalPdf = async ({
  url,
  filename,
}: {
  url: string;
  filename: string;
}) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const blob = await response.blob();

  return blobToFile(blob, filename);
};

export const uploadFileToBucket = async ({
  url,
  file,
}: {
  url: string;
  file: File;
}): Promise<AxiosResponse> => {
  const response = await apiHttpClient.put(url, file);

  return response;
};
