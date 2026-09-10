import { apiHttpClient } from "@/shared/api/api-http-client";
import { API_ROUTES } from "@/shared/api/api-routes";

import type { IDocument, IDocumentById, IUserFile } from "../model/types";

/**
 * GET /api/v1/files - dashboard listing for the authenticated user.
 */
export const listUserFiles = async (): Promise<IUserFile[]> => {
  const response = await apiHttpClient.get<{ files: IUserFile[] }>(
    API_ROUTES.FILES_LIST
  );

  return response.data?.files ?? [];
};

/**
 * GET /api/v1/files/download/:id - signed download URL.
 */
export const getDownloadInfo = async (id: string): Promise<IDocumentById> => {
  const response = await apiHttpClient.get<IDocumentById>(
    API_ROUTES.FILE_DOWNLOAD(id)
  );

  if (!response.data) {
    throw new Error(`No download info returned for file ${id}`);
  }

  return response.data;
};

/**
 * DELETE /api/v1/files/:id - soft-delete a file.
 */
export const deleteFile = async (id: string): Promise<void> => {
  await apiHttpClient.delete(API_ROUTES.FILE_DELETE(id));
};

/**
 * POST /api/v1/files/bulk-delete - delete multiple files at once.
 */
export const bulkDeleteFiles = async (
  ids: string[]
): Promise<{ deleted: number }> => {
  const response = await apiHttpClient.post<{ deleted: number }>(
    API_ROUTES.FILES_BULK_DELETE,
    { ids }
  );

  return response.data;
};

/**
 * PATCH /api/v1/files/:id/rename - rename a file.
 */
export const renameFile = async (
  id: string,
  filename: string
): Promise<{ status: boolean }> => {
  const response = await apiHttpClient.patch<{ status: boolean }>(
    API_ROUTES.FILE_RENAME(id),
    { filename }
  );

  return response.data;
};

/**
 * POST /api/v1/files/:id/duplicate - duplicate a file.
 */
export const duplicateFile = async (id: string): Promise<IDocument> => {
  const response = await apiHttpClient.post<IDocument>(
    API_ROUTES.FILE_DUPLICATE(id)
  );

  return response.data;
};

/**
 * GET /api/v1/files/:id/share-link - 7-day signed URL for sharing.
 */
export const getShareLink = async (id: string): Promise<string> => {
  const response = await apiHttpClient.get<{ url: string }>(
    API_ROUTES.FILE_SHARE_LINK(id)
  );

  return response.data.url;
};

/**
 * POST /api/v1/files/share-via-email - email a file to a recipient.
 */
export const shareFileViaEmail = async (data: {
  fileId: string;
  filename: string;
  recipientEmail: string;
  message?: string;
}): Promise<void> => {
  await apiHttpClient.post(API_ROUTES.FILE_SHARE_EMAIL, data);
};

/**
 * POST /api/v1/files - register a file's metadata after S3 upload.
 */
export const registerUploadedFile = async (data: {
  filename: string;
  size: number;
  key: string;
  pagesCount: number | null;
}): Promise<IDocument> => {
  const response = await apiHttpClient.post<IDocument>(
    API_ROUTES.FILE_UPLOADED,
    data
  );

  return response.data;
};
