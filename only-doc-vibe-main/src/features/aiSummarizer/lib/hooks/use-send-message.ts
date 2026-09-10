import { useCallback } from "react";

import { trackEvent } from "@/shared/lib/analytics";
import { EAnalyticsEvents } from "@/shared/lib/analytics/events";

import { sendMessage } from "../../api/send-message";
import { MAX_MESSAGE_CHARS } from "../../model/constants";
import { useAiSummarizerStore } from "../../model/store/ai-summarizer-store";

export class MessageTooLongError extends Error {
  constructor() {
    super("Message too long");
    this.name = "MessageTooLongError";
  }
}

export const useSendMessage = () => {
  const store = useAiSummarizerStore;

  return useCallback(
    async (question: string): Promise<void> => {
      const trimmed = question.trim();
      if (!trimmed) return;

      if (trimmed.length > MAX_MESSAGE_CHARS) {
        throw new MessageTooLongError();
      }

      const startedAtChatId = store.getState().currentChatId;
      if (!startedAtChatId) return;

      // Snapshot the pre-send messages so we can roll the optimistic user
      // bubble back if the request fails.
      const messagesBeforeSend = store.getState().messages;

      const isStillOnSameChat = (): boolean =>
        store.getState().currentChatId === startedAtChatId;

      store.getState().addUserMessage(trimmed);
      trackEvent(EAnalyticsEvents.SUMMARIZER_SEND_PROMPT, {
        chat_id: startedAtChatId,
        prompt_length: trimmed.length,
      });

      store.getState().setIsSending(true);
      try {
        const { answer } = await sendMessage(startedAtChatId, trimmed);

        // If the user switched chats mid-flight, don't bleed this answer
        // (or the isSending flag) into whatever they're looking at now.
        if (!isStillOnSameChat()) return;

        store.getState().addAssistantMessage(answer);
      } catch (error) {
        // Roll back the optimistic user bubble so the input clears cleanly
        // and the chat doesn't show a phantom message with no reply. Only
        // touch the store if we're still on the chat that owned the send.
        if (isStillOnSameChat()) {
          store.getState().setMessages(messagesBeforeSend);
        }

        throw error;
      } finally {
        if (isStillOnSameChat()) {
          store.getState().setIsSending(false);
        }
      }
    },
    [store]
  );
};
