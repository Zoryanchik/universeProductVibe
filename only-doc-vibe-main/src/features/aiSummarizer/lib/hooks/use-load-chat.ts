import { useCallback } from "react";

import { trackEvent } from "@/shared/lib/analytics";
import { EAnalyticsEvents } from "@/shared/lib/analytics/events";
import { SSEEventBus } from "@/shared/api/sse/sseEventBus";
import { ESSEventType } from "@/shared/api/sse/sse-event-type";

import { getConversation } from "../../api/get-conversation";
import { getMessages } from "../../api/get-messages";
import {
  waitForChatReady,
  ChatProcessingFailedError,
} from "../../api/wait-for-chat-ready";
import { useAiSummarizerStore } from "../../model/store/ai-summarizer-store";
import { loadPreviewIntoStore } from "../load-preview-into-store";
import { messagesToChatMessages } from "../mappers";
import {
  getStoredPdfBlobUrlToken,
  resolveChatPreviewUrl,
} from "../pdf-blob-storage";

/** Bound the SSE retry listener so it cleans up even if the preview event
 *  never arrives (BE bug, file processing crash, user moves on, etc.). */
const PREVIEW_READY_LISTENER_TTL_MS = 5 * 60 * 1000;

/**
 * Resolves the PDF preview into the store: IndexedDB cache → fetch-by-fileId →
 * wait for `chat-preview-ready` SSE if the BE doesn't have the file yet.
 */
const ensurePreviewLoaded = async (
  chatId: string,
  previewFileId: string
): Promise<void> => {
  const isStillCurrent = (): boolean =>
    useAiSummarizerStore.getState().currentChatId === chatId;

  if (useAiSummarizerStore.getState().currentFileUrl) return;

  const cachedUrl = await resolveChatPreviewUrl(
    getStoredPdfBlobUrlToken(chatId)
  );
  if (!isStillCurrent()) return;

  if (cachedUrl) {
    useAiSummarizerStore.getState().setCurrentFileUrl(cachedUrl);

    return;
  }

  if (!previewFileId) return;

  try {
    await loadPreviewIntoStore(previewFileId, chatId);
  } catch {
    let off: (() => void) | null = null;
    const cleanup = () => {
      off?.();
      off = null;
      window.clearTimeout(timeoutId);
    };

    off = SSEEventBus.on(ESSEventType.CHAT_PREVIEW_READY, (event) => {
      if (event.chatId !== chatId) return;

      cleanup();
      if (!isStillCurrent()) return;

      loadPreviewIntoStore(event.previewFileId, chatId).catch(() => null);
    });

    const timeoutId = window.setTimeout(cleanup, PREVIEW_READY_LISTENER_TTL_MS);
  }
};

export const useLoadChat = () => {
  const store = useAiSummarizerStore;

  return useCallback(
    async (chatId: string): Promise<void> => {
      store.setState({
        currentChatId: chatId,
        status: "waiting",
        messages: [],
      });

      // Stale-callback guard: if the user switches chats mid-load, abandon
      // every write below so it doesn't overwrite the new chat's state.
      const isStillCurrent = (): boolean =>
        store.getState().currentChatId === chatId;

      let conversation = await getConversation(chatId);
      if (!isStillCurrent()) return;

      const startedInWaitingState = conversation.status === "WAITING";

      void ensurePreviewLoaded(chatId, conversation.previewFileId);

      if (startedInWaitingState) {
        try {
          const result = await waitForChatReady({ chatId });
          if (!isStillCurrent()) return;

          conversation = result.conversation;
          trackEvent(EAnalyticsEvents.SUMMARIZER_CHAT_READY, {
            chat_id: chatId,
          });
        } catch (error) {
          if (!isStillCurrent()) return;

          if (error instanceof ChatProcessingFailedError) {
            store.setState({ status: "failed" });
            trackEvent(EAnalyticsEvents.SUMMARIZER_CHAT_FAILED, {
              chat_id: chatId,
              error: error.name,
            });
            throw error;
          }

          trackEvent(EAnalyticsEvents.SUMMARIZER_CHAT_FAILED, {
            chat_id: chatId,
            error: error instanceof Error ? error.name : "unknown",
          });
          throw error;
        }
      }

      if (!isStillCurrent()) return;

      const status = conversation.status === "READY" ? "ready" : "failed";

      store.setState({
        currentChatId: chatId,
        previewFileId: conversation.previewFileId,
        fileName: conversation.chatName,
        summary: conversation.summary,
        insights: conversation.insights,
        suggestedQuestions: conversation.suggestedQuestions,
        status,
      });

      if (status === "ready") {
        const messages = await getMessages(chatId);
        if (!isStillCurrent()) return;

        store.setState({
          messages: messagesToChatMessages(messages, chatId),
        });
      }
    },
    [store]
  );
};
