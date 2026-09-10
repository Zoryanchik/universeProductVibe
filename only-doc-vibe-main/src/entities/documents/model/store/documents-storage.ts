import {
  InternalFileType,
  isInternalFileType,
} from "@/shared/constants/file-type";
import { LOCAL_STORAGE_KEYS } from "@/shared/constants/local-storage-keys";
import { appStorage } from "@/shared/lib/storage/app-storage";
import { SESSION_STORAGE_KEYS } from "@/shared/constants/session-storage-keys";
import { IDBStorage } from "@/shared/lib/storage/indexeddb-storage";

import { isFunnel, type EFunnels } from "../constants/funnels";
import { isServiceType, type EServiceType } from "../constants/service";

export const DocumentsStorage = {
  getPDFfileContent: async (): Promise<string | null> => {
    const appStorageValue = appStorage.getItem(
      LOCAL_STORAGE_KEYS.PDF_FILE_CONTENT
    );

    if (appStorageValue) return appStorageValue;

    try {
      const indexedDBStorage = await IDBStorage.getInstance();

      return (
        indexedDBStorage.getItem(LOCAL_STORAGE_KEYS.PDF_FILE_CONTENT) || null
      );
    } catch {
      return null;
    }
  },
  setPDFfileContent: async (document: string) => {
    try {
      appStorage.setItem(LOCAL_STORAGE_KEYS.PDF_FILE_CONTENT, document);
    } catch {
      const indexedDBStorage = await IDBStorage.getInstance();

      indexedDBStorage.setItem(LOCAL_STORAGE_KEYS.PDF_FILE_CONTENT, document);
    }
  },
  clearPDFfileContent: async () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.PDF_FILE_CONTENT);

    try {
      const indexedDBStorage = await IDBStorage.getInstance();

      indexedDBStorage.removeItem(LOCAL_STORAGE_KEYS.PDF_FILE_CONTENT);
    } catch {
      // do nothing
    }
  },

  getPreviewFileContent: async (): Promise<string | null> => {
    const appStorageValue = appStorage.getItem(
      LOCAL_STORAGE_KEYS.PREVIEW_FILE_CONTENT
    );

    if (appStorageValue) return appStorageValue;

    try {
      const indexedDBStorage = await IDBStorage.getInstance();

      return (
        indexedDBStorage.getItem(LOCAL_STORAGE_KEYS.PREVIEW_FILE_CONTENT) ||
        null
      );
    } catch {
      return null;
    }
  },
  setPreviewFileContent: async (previewFileContent: string) => {
    appStorage.setItem(
      LOCAL_STORAGE_KEYS.PREVIEW_FILE_CONTENT,
      previewFileContent
    );

    try {
      const indexedDBStorage = await IDBStorage.getInstance();

      indexedDBStorage.setItem(
        LOCAL_STORAGE_KEYS.PREVIEW_FILE_CONTENT,
        previewFileContent
      );
    } catch {
      // do nothing
    }
  },
  clearPreviewFileContent: async () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.PREVIEW_FILE_CONTENT);

    try {
      const indexedDBStorage = await IDBStorage.getInstance();

      indexedDBStorage.removeItem(LOCAL_STORAGE_KEYS.PREVIEW_FILE_CONTENT);
    } catch {
      // do nothing
    }
  },

  getFormatFrom: (): InternalFileType => {
    const formatFrom = appStorage.getItem(LOCAL_STORAGE_KEYS.FORMAT_FROM);

    if (isInternalFileType(formatFrom)) {
      return formatFrom as InternalFileType;
    }

    return InternalFileType.PDF;
  },
  setFormatFrom: (format: InternalFileType) => {
    appStorage.setItem(LOCAL_STORAGE_KEYS.FORMAT_FROM, format);
  },
  clearFormatFrom: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.FORMAT_FROM);
  },

  getFormatTo: (): InternalFileType => {
    const formatTo = appStorage.getItem(LOCAL_STORAGE_KEYS.FORMAT_TO);

    if (isInternalFileType(formatTo)) {
      return formatTo as InternalFileType;
    }

    return InternalFileType.PDF;
  },
  setFormatTo: (format: InternalFileType) => {
    appStorage.setItem(LOCAL_STORAGE_KEYS.FORMAT_TO, format);
  },
  clearFormatTo: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.FORMAT_TO);
  },

  getPreviewUrl: (): string | null => {
    return appStorage.getItem(LOCAL_STORAGE_KEYS.PREVIEW_URL) || null;
  },
  setPreviewUrl: (url: string) => {
    appStorage.setItem(LOCAL_STORAGE_KEYS.PREVIEW_URL, url);
  },
  clearPreviewUrl: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.PREVIEW_URL);
  },

  getFunnel: (): EFunnels | null => {
    const funnel = appStorage.getItem(LOCAL_STORAGE_KEYS.FUNNEL);

    return isFunnel(funnel) ? funnel : null;
  },
  setFunnel: (funnel: EFunnels) => {
    appStorage.setItem(LOCAL_STORAGE_KEYS.FUNNEL, funnel);
  },
  clearFunnel: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.FUNNEL);
  },

  getServiceType: (): EServiceType | null => {
    const serviceType = appStorage.getItem(LOCAL_STORAGE_KEYS.SERVICE_TYPE);

    return isServiceType(serviceType) ? serviceType : null;
  },
  setServiceType: (serviceType: EServiceType) => {
    appStorage.setItem(LOCAL_STORAGE_KEYS.SERVICE_TYPE, serviceType);
  },
  clearServiceType: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.SERVICE_TYPE);
  },

  getInitialPagesCount: (): number => {
    const pagesCount = Number(
      appStorage.getItem(LOCAL_STORAGE_KEYS.INITIAL_PAGES_COUNT)
    );

    if (Number.isNaN(pagesCount)) return 0;

    return pagesCount;
  },
  setInitialPagesCount: (pagesCount: number) => {
    appStorage.setItem(
      LOCAL_STORAGE_KEYS.INITIAL_PAGES_COUNT,
      String(pagesCount)
    );
  },
  clearInitialPagesCount: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.INITIAL_PAGES_COUNT);
  },

  getInitialFileSize: (): number => {
    const fileSize = Number(
      appStorage.getItem(LOCAL_STORAGE_KEYS.INITIAL_FILE_SIZE)
    );

    if (Number.isNaN(fileSize)) return 0;

    return fileSize;
  },
  setInitialFileSize: (fileSize: number) => {
    appStorage.setItem(LOCAL_STORAGE_KEYS.INITIAL_FILE_SIZE, String(fileSize));
  },
  clearInitialFileSize: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.INITIAL_FILE_SIZE);
  },

  getMergedFilesCount: (): number => {
    const mergedFilesCount = Number(
      appStorage.getItem(LOCAL_STORAGE_KEYS.MERGED_FILES_COUNT)
    );
    if (Number.isNaN(mergedFilesCount)) return 0;

    return mergedFilesCount;
  },
  setMergedFilesCount: (mergedFilesCount: number) => {
    appStorage.setItem(
      LOCAL_STORAGE_KEYS.MERGED_FILES_COUNT,
      String(mergedFilesCount)
    );
  },
  clearMergedFilesCount: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.MERGED_FILES_COUNT);
  },

  getFilename: (): string | null => {
    return appStorage.getItem(LOCAL_STORAGE_KEYS.FILENAME) || null;
  },
  setFilename: (filename: string) => {
    appStorage.setItem(LOCAL_STORAGE_KEYS.FILENAME, filename);
  },
  clearFilename: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.FILENAME);
  },

  getUrlExpiresAt: (): number | null => {
    const urlExpiresAt = appStorage.getItem(LOCAL_STORAGE_KEYS.URL_EXPIRES_AT);

    return urlExpiresAt ? Number(urlExpiresAt) : null;
  },
  setUrlExpiresAt: (urlExpiresAt: number) => {
    appStorage.setItem(LOCAL_STORAGE_KEYS.URL_EXPIRES_AT, String(urlExpiresAt));
  },
  clearUrlExpiresAt: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.URL_EXPIRES_AT);
  },

  getDocumentId: (): string | null => {
    const documentId = appStorage.getItem(LOCAL_STORAGE_KEYS.DOCUMENT_ID);

    return documentId || null;
  },
  setDocumentId: (documentId: string) => {
    appStorage.setItem(LOCAL_STORAGE_KEYS.DOCUMENT_ID, documentId);
  },
  clearDocumentId: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.DOCUMENT_ID);
  },

  getWatermarkOriginalFileUrl: (): string | null => {
    return (
      appStorage.getItem(LOCAL_STORAGE_KEYS.WATERMARK_ORIGINAL_FILE_URL) || null
    );
  },
  setWatermarkOriginalFileUrl: (watermarkOriginalFileUrl: string) => {
    appStorage.setItem(
      LOCAL_STORAGE_KEYS.WATERMARK_ORIGINAL_FILE_URL,
      watermarkOriginalFileUrl
    );
  },
  clearWatermarkOriginalFileUrl: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.WATERMARK_ORIGINAL_FILE_URL);
  },

  getFileKey: (): string | null => {
    return appStorage.getItem(LOCAL_STORAGE_KEYS.FILE_KEY) || null;
  },
  setFileKey: (fileKey: string) => {
    appStorage.setItem(LOCAL_STORAGE_KEYS.FILE_KEY, fileKey);
  },
  clearFileKey: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.FILE_KEY);
  },

  getResultFileUrl: (): string | null => {
    return appStorage.getItem(LOCAL_STORAGE_KEYS.RESULT_FILE_URL) || null;
  },
  setResultFileUrl: (resultFileUrl: string) => {
    appStorage.setItem(LOCAL_STORAGE_KEYS.RESULT_FILE_URL, resultFileUrl);
  },
  clearResultFileUrl: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.RESULT_FILE_URL);
  },

  getUploadUrl: (): string | null => {
    return appStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_URL) || null;
  },
  setUploadUrl: (currentUrl: string) => {
    appStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_URL, currentUrl);
  },
  clearUploadUrl: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_URL);
  },

  getExportFilesCount: (): number => {
    const exportFilesCount = Number(
      appStorage.getItem(LOCAL_STORAGE_KEYS.EXPORT_FILES_COUNT)
    );
    if (Number.isNaN(exportFilesCount)) return 0;

    return exportFilesCount;
  },
  setExportFilesCount: (exportFilesCount: number) => {
    appStorage.setItem(
      LOCAL_STORAGE_KEYS.EXPORT_FILES_COUNT,
      String(exportFilesCount)
    );
  },
  clearExportFilesCount: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.EXPORT_FILES_COUNT);
  },

  getWillDownloadBySSE: (): boolean | null => {
    const willDownloadBySSE = sessionStorage.getItem(
      SESSION_STORAGE_KEYS.WILL_DOWNLOAD_BY_SSE
    );

    return willDownloadBySSE ? Boolean(willDownloadBySSE) : null;
  },
  setWillDownloadBySSE: (willDownloadBySSE: boolean) => {
    sessionStorage.setItem(
      SESSION_STORAGE_KEYS.WILL_DOWNLOAD_BY_SSE,
      String(willDownloadBySSE)
    );
  },
  clearWillDownloadBySSE: () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEYS.WILL_DOWNLOAD_BY_SSE);
  },

  clearAll: () => {
    DocumentsStorage.clearFormatFrom();
    DocumentsStorage.clearFormatTo();
    DocumentsStorage.clearPreviewUrl();
    DocumentsStorage.clearFunnel();
    DocumentsStorage.clearDocumentId();
    DocumentsStorage.clearServiceType();
    DocumentsStorage.clearInitialPagesCount();
    DocumentsStorage.clearInitialFileSize();
    DocumentsStorage.clearPDFfileContent();
    DocumentsStorage.clearMergedFilesCount();
    DocumentsStorage.clearFilename();
    DocumentsStorage.clearWatermarkOriginalFileUrl();
    DocumentsStorage.clearFileKey();
    DocumentsStorage.clearResultFileUrl();
    DocumentsStorage.clearUploadUrl();
    DocumentsStorage.clearExportFilesCount();
    DocumentsStorage.clearWillDownloadBySSE();
  },
};
