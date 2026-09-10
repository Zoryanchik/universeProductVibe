import { SSEEventBus } from "@/shared/api/sse/sseEventBus";
import { ESSEventType } from "@/shared/api/sse/sse-event-type";
import type {
  SSEChatPreviewReadyEvent,
  SSEChatStatusChangedEvent,
  SSEFileProcessingErrorEvent,
} from "@/shared/api/sse/types";

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

export interface WaitForChatPreviewReadyOptions {
  chatId: string;
  watchFileIds?: readonly string[];
  timeoutMs?: number;
}

export interface WaitForChatPreviewReadyResult {
  /**
   * The preview file id reported by the SSE event. Empty string when
   * the chat went straight to READY without a separate preview event
   * (no-conversion path) — caller should fall back to the previewFileId
   * it already has from /initialize or /conversation.
   */
  previewFileId: string;
}

export class PreviewReadyTimeoutError extends Error {
  constructor() {
    super("Chat preview did not become ready in time");
    this.name = "PreviewReadyTimeoutError";
  }
}

export class PreviewProcessingFailedError extends Error {
  constructor(message = "Chat preview processing failed") {
    super(message);
    this.name = "PreviewProcessingFailedError";
  }
}

/**
 * Resolves when the BE signals the PDF preview is ready for a given chat,
 * either by emitting `chat-preview-ready` or by transitioning the chat to
 * `READY` (which implies preview is also ready). Rejects on `FAILED`
 * status, a matching `file-processing-error`, or after `timeoutMs`.
 */
export const waitForChatPreviewReady = (
  options: WaitForChatPreviewReadyOptions
): Promise<WaitForChatPreviewReadyResult> => {
  const { chatId, watchFileIds = [], timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const watched = new Set(watchFileIds);

  return new Promise<WaitForChatPreviewReadyResult>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      SSEEventBus.off(ESSEventType.CHAT_PREVIEW_READY, onPreviewReady);
      SSEEventBus.off(ESSEventType.CHAT_STATUS_CHANGED, onStatusChanged);
      SSEEventBus.off(ESSEventType.FILE_PROCESSING_ERROR, onFileError);
      window.clearTimeout(timeoutId);
    };

    const settle = (result: WaitForChatPreviewReadyResult) => {
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

    const onPreviewReady = (data: SSEChatPreviewReadyEvent) => {
      if (data.chatId !== chatId) return;

      settle({ previewFileId: data.previewFileId });
    };

    const onStatusChanged = (data: SSEChatStatusChangedEvent) => {
      if (data.chatId !== chatId) return;

      if (data.status === "FAILED") {
        fail(new PreviewProcessingFailedError());

        return;
      }

      if (data.status === "READY") {
        settle({ previewFileId: "" });
      }
    };

    const onFileError = (event: SSEFileProcessingErrorEvent) => {
      if (!watched.has(event.data.id)) return;

      fail(new PreviewProcessingFailedError("Document processing failed"));
    };

    SSEEventBus.on(ESSEventType.CHAT_PREVIEW_READY, onPreviewReady);
    SSEEventBus.on(ESSEventType.CHAT_STATUS_CHANGED, onStatusChanged);
    SSEEventBus.on(ESSEventType.FILE_PROCESSING_ERROR, onFileError);

    const timeoutId = window.setTimeout(() => {
      fail(new PreviewReadyTimeoutError());
    }, timeoutMs);
  });
};
