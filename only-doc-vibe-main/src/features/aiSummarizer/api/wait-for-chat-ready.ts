import { SSEEventBus } from "@/shared/api/sse/sseEventBus";
import { ESSEventType } from "@/shared/api/sse/sse-event-type";

import { getConversation } from "./get-conversation";
import type { ConversationItem } from "./types";

const READY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export interface WaitForChatReadyOptions {
  chatId: string;
  watchFileIds?: readonly string[];
  onPreviewReady?: (previewFileId: string) => void;
}

export interface WaitForChatReadyResult {
  conversation: ConversationItem;
}

export class ChatReadyTimeoutError extends Error {
  constructor() {
    super("Chat did not become ready in time");
    this.name = "ChatReadyTimeoutError";
  }
}

export class ChatProcessingFailedError extends Error {
  constructor(message = "Chat processing failed") {
    super(message);
    this.name = "ChatProcessingFailedError";
  }
}

export const waitForChatReady = (
  options: WaitForChatReadyOptions
): Promise<WaitForChatReadyResult> => {
  const { chatId, watchFileIds = [], onPreviewReady } = options;
  const watched = new Set(watchFileIds);

  return new Promise<WaitForChatReadyResult>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      SSEEventBus.off(ESSEventType.CHAT_STATUS_CHANGED, onStatusChanged);
      SSEEventBus.off(ESSEventType.CHAT_PREVIEW_READY, onPreviewReadyEvent);
      SSEEventBus.off(ESSEventType.FILE_PROCESSING_ERROR, onFileError);
      window.clearTimeout(timeoutId);
    };

    const settle = (result: WaitForChatReadyResult) => {
      if (settled) return;

      settled = true;
      cleanup();
      resolve(result);
    };

    const fail = (error: Error) => {
      if (settled) return;

      settled = true;
      cleanup();
      reject(error);
    };

    const onStatusChanged = (data: {
      chatId: string;
      status: "READY" | "WAITING" | "FAILED";
    }) => {
      if (data.chatId !== chatId) return;

      if (data.status === "READY") {
        getConversation(chatId)
          .then((conversation) => settle({ conversation }))
          .catch((error) =>
            fail(
              error instanceof Error
                ? error
                : new ChatProcessingFailedError(String(error))
            )
          );
      } else if (data.status === "FAILED") {
        fail(new ChatProcessingFailedError());
      }
    };

    const onPreviewReadyEvent = (data: {
      chatId: string;
      previewFileId: string;
    }) => {
      if (data.chatId !== chatId) return;

      onPreviewReady?.(data.previewFileId);
    };

    const onFileError = (event: { data: { id: string } }) => {
      if (!watched.has(event.data.id)) return;

      fail(new ChatProcessingFailedError("Document processing failed"));
    };

    SSEEventBus.on(ESSEventType.CHAT_STATUS_CHANGED, onStatusChanged);
    SSEEventBus.on(ESSEventType.CHAT_PREVIEW_READY, onPreviewReadyEvent);
    SSEEventBus.on(ESSEventType.FILE_PROCESSING_ERROR, onFileError);

    const timeoutId = window.setTimeout(() => {
      fail(new ChatReadyTimeoutError());
    }, READY_TIMEOUT_MS);
  });
};
