import React, { useEffect, useRef } from "react";

import { useAiSummarizerStore } from "../../../model/store/ai-summarizer-store";
import { AnalyzingLoader } from "../../Loader/AnalyzingLoader";
import { ChatLoadError } from "./ChatLoadError";
import { InitialSummary } from "./InitialSummary";
import { AiResponse } from "./messages/AiResponse";
import { UserResponse } from "./messages/UserResponse";

interface ConversationProps {
  onUpload: () => void;
  onPickSuggestedQuestion: (q: string) => void;
}

export const Conversation: React.FC<ConversationProps> = ({
  onUpload,
  onPickSuggestedQuestion,
}) => {
  const status = useAiSummarizerStore.use.status();
  const summary = useAiSummarizerStore.use.summary();
  const insights = useAiSummarizerStore.use.insights();
  const suggestedQuestions = useAiSummarizerStore.use.suggestedQuestions();
  const messages = useAiSummarizerStore.use.messages();
  const isSending = useAiSummarizerStore.use.isSending();

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isSending]);

  if (status === "idle") {
    return null;
  }

  if (status === "failed") {
    return <ChatLoadError onRetry={onUpload} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4">
      {status === "ready" && summary && (
        <InitialSummary
          summary={summary}
          insights={insights}
          suggestedQuestions={suggestedQuestions}
          onPickSuggestedQuestion={onPickSuggestedQuestion}
        />
      )}
      {messages.map((m, i) =>
        m.role === "user" ? (
          <UserResponse key={i} content={m.content} />
        ) : (
          <AiResponse key={i} content={m.content} />
        )
      )}
      {status === "waiting" && <AnalyzingLoader />}
      {isSending && <AnalyzingLoader showText={false} />}
      <div ref={bottomRef} />
    </div>
  );
};
