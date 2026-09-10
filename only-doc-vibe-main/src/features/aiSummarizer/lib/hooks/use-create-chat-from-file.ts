import { useCallback } from "react";

import { getFileKeyFromAWSLink } from "@/shared/lib/documents/getFileKeyFromAWSLink";
import { countPdfPages } from "@/shared/lib/documents/countPdfPages";
import { trackEvent } from "@/shared/lib/analytics";
import { EAnalyticsEvents } from "@/shared/lib/analytics/events";

import { getUploadLink } from "@/entities/documents";
import { uploadFileToBucket } from "@/entities/documents";

import { initializeConversation } from "../../api/initialize-conversation";
import type { InitializeConversationResult } from "../../api/types";
import { useAiSummarizerStore } from "../../model/store/ai-summarizer-store";
import { isAcceptedExtension } from "../derive-cms-config";
import { savePdfBlobForChat } from "../pdf-blob-storage";
import { MAX_FILE_SIZE_BYTES, MAX_PAGES } from "../../model/constants";

const isNativelyRenderablePdf = (filename: string): boolean =>
  filename.toLowerCase().endsWith(".pdf");

export class UnsupportedFileError extends Error {
  constructor() {
    super("Unsupported file format");
    this.name = "UnsupportedFileError";
  }
}

export class FileTooLargeError extends Error {
  constructor() {
    super("File too large");
    this.name = "FileTooLargeError";
  }
}

export class TooManyPagesError extends Error {
  constructor() {
    super("Too many pages");
    this.name = "TooManyPagesError";
  }
}

export interface CreateChatResult {
  init: InitializeConversationResult;
  chatId: string;
}

const uploadFileToS3 = async (file: File): Promise<{ awsKey: string }> => {
  const uploadLink = await getUploadLink(file.name);
  if (!uploadLink) {
    throw new Error("Failed to get upload link");
  }

  await uploadFileToBucket({ url: uploadLink.url, file });
  const awsKey = getFileKeyFromAWSLink(uploadLink.url);

  return { awsKey };
};

const tryReadPdfPagesCount = async (file: File): Promise<number | null> => {
  if (!file.name.toLowerCase().endsWith(".pdf")) return null;

  try {
    return await countPdfPages(file);
  } catch {
    return null;
  }
};

export const useCreateChatFromFile = () => {
  const store = useAiSummarizerStore;

  return useCallback(
    async (file: File): Promise<CreateChatResult> => {
      const state = store.getState();
      const acceptedFormats = state.cmsConfig?.acceptedFormats ?? [];

      if (!isAcceptedExtension(file.name, acceptedFormats)) {
        throw new UnsupportedFileError();
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new FileTooLargeError();
      }

      trackEvent(EAnalyticsEvents.SUMMARIZER_UPLOAD_TAP, {
        file_size_mb: Math.round((file.size / 1024 / 1024) * 10) / 10,
        file_extension: file.name.split(".").pop()?.toLowerCase() ?? "",
      });

      const { awsKey } = await uploadFileToS3(file);
      const pagesCount = await tryReadPdfPagesCount(file);

      if (pagesCount !== null && pagesCount > MAX_PAGES) {
        throw new TooManyPagesError();
      }

      store.setState({
        fileName: file.name,
        status: "waiting",
        messages: [],
        summary: null,
        insights: null,
        suggestedQuestions: null,
      });

      const init = await initializeConversation({
        filename: file.name,
        size: file.size,
        key: awsKey,
        pagesCount,
      });

      // Native PDFs: render the local file straight away and persist to
      // IndexedDB so the next open is instant.
      if (isNativelyRenderablePdf(file.name)) {
        savePdfBlobForChat(init.chatId, file).catch(() => null);
        const blobUrl = URL.createObjectURL(file);
        store.getState().setCurrentFileUrl(blobUrl);
      }

      store.setState({
        currentChatId: init.chatId,
        fileId: init.fileId,
        previewFileId: init.previewFileId,
      });

      trackEvent(EAnalyticsEvents.SUMMARIZER_START_CHAT, {
        chat_id: init.chatId,
      });

      return { init, chatId: init.chatId };
    },
    [store]
  );
};
