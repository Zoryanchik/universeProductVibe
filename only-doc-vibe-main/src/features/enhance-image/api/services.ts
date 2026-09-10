import { apiHttpClient } from "@/shared/api/api-http-client";
import { API_ROUTES } from "@/shared/api/api-routes";
import { getFileKeyFromAWSLink } from "@/shared/lib/documents/getFileKeyFromAWSLink";

interface IEnhanceImageBackendResponse {
  success: boolean;
  originalFileId: string;
}

interface IDownloadFileResponse {
  url: string;
  filename: string;
  size: number;
  format: string;
}

export interface IEnhanceImageUploadedData {
  success: boolean;
  originalFileId: string;
  url: string;
}

export interface IUploadFileToEnhanceImageResult {
  document: IEnhanceImageUploadedData;
  originalFileUrl: string;
}

const pollForDownloadUrl = async (
  fileId: string,
  maxAttempts = 30,
  delayMs = 2000
): Promise<string> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await apiHttpClient.get<IDownloadFileResponse>(
        API_ROUTES.FILE_DOWNLOAD(fileId)
      );

      return response.data.url;
    } catch {
      if (attempt === maxAttempts) {
        throw new Error(`File not ready after ${maxAttempts} attempts`);
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error("Failed to get download URL");
};

export const uploadFileToEnhanceImage = async ({
  url,
  file,
  level = 2,
}: {
  url: string;
  file: File;
  level?: number;
}): Promise<IUploadFileToEnhanceImageResult> => {
  const dto = {
    filename: file.name,
    size: file.size,
    key: getFileKeyFromAWSLink(url),
    level,
  };

  const response = await apiHttpClient.post<IEnhanceImageBackendResponse>(
    API_ROUTES.ENHANCE_IMAGE_UPLOAD,
    dto
  );

  const { originalFileId, success } = response.data;

  const downloadUrl = await pollForDownloadUrl(originalFileId);

  return {
    document: {
      success,
      originalFileId,
      url: downloadUrl,
    },
    originalFileUrl: url,
  };
};
