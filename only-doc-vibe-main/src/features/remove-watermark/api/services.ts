import { apiHttpClient } from "@/shared/api/api-http-client";
import { API_ROUTES } from "@/shared/api/api-routes";
import { getFileKeyFromAWSLink } from "@/shared/lib/documents/getFileKeyFromAWSLink";

/**
 * Response from the backend remove-watermark endpoint
 */
interface IRemoveWatermarkBackendResponse {
  success: boolean;
  fileId: string;
}

/**
 * Response from the backend download endpoint
 */
interface IDownloadFileResponse {
  url: string;
  filename: string;
  size: number;
  format: string;
}

/**
 * Transformed response with the signed download URL
 */
export interface IRemoveWatermarkUploadedData {
  success: boolean;
  originalFileId: string;
  url: string;
  text?: string[];
}

export interface IUploadFileToRemoveWatermarkResult {
  document: IRemoveWatermarkUploadedData;
  originalFileUrl: string;
}

/**
 * Poll for file download URL with retry logic
 * Waits for the file to be processed and returns the signed download URL
 */
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
      // If not found (404) or other error, retry
      if (attempt === maxAttempts) {
        throw new Error(`File not ready after ${maxAttempts} attempts`);
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error("Failed to get download URL");
};

export const uploadFileToRemoveWatermark = async ({
  url,
  file,
  text,
}: {
  url: string;
  file: File;
  text?: string[];
}): Promise<IUploadFileToRemoveWatermarkResult> => {
  // TODO: Implement text selection UI.
  const watermarkText = text && text.length > 0 ? text : [];

  const dto = {
    filename: file.name,
    size: file.size,
    key: getFileKeyFromAWSLink(url),
    text: watermarkText,
  };

  const documentResponse =
    await apiHttpClient.post<IRemoveWatermarkBackendResponse>(
      API_ROUTES.REMOVE_WATERMARK_UPLOAD,
      dto
    );

  const { fileId, success } = documentResponse.data;

  // Poll for the signed download URL (file is processed asynchronously)
  const downloadUrl = await pollForDownloadUrl(fileId);

  return {
    document: {
      success,
      originalFileId: fileId,
      url: downloadUrl,
      text,
    },
    originalFileUrl: url,
  };
};
