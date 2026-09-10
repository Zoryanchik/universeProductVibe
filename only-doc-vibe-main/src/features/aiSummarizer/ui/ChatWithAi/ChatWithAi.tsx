import React, { useCallback } from "react";

import { logger } from "@/shared/lib/utils/logger";

import { Conversation } from "./Conversation/Conversation";
import { MessageInput } from "./Input/MessageInput";
import { useSendMessage } from "../../lib/hooks/use-send-message";
import { useAiSummarizerErrorToast } from "../../lib/use-ai-summarizer-error-toast";

interface ChatWithAiProps {
  onUpload: () => void;
}

export const ChatWithAi: React.FC<ChatWithAiProps> = ({ onUpload }) => {
  const sendMessage = useSendMessage();
  const notifyError = useAiSummarizerErrorToast();

  const handleSubmit = useCallback(
    async (text: string) => {
      try {
        await sendMessage(text);
      } catch (err) {
        logger.error("sendMessage failed:", err);
        notifyError(err, { fallback: "sendFailed" });
        // Re-throw so MessageInput can restore the typed text for retry.
        // useSendMessage already rolled the optimistic user bubble back.
        throw err;
      }
    },
    [notifyError, sendMessage]
  );

  const handlePickSuggestedQuestion = useCallback(
    (q: string) => {
      sendMessage(q).catch((err) => {
        logger.error("sendMessage failed:", err);
        notifyError(err, { fallback: "sendFailed" });
      });
    },
    [notifyError, sendMessage]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <Conversation
          onUpload={onUpload}
          onPickSuggestedQuestion={handlePickSuggestedQuestion}
        />
      </div>
      <MessageInput onSubmit={handleSubmit} />
    </div>
  );
};
