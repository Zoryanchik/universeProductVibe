import React, { useMemo } from "react";

import { useTranslation } from "@/shared/lib/translations";

import { AiMessageLayout } from "./messages/AiMessageLayout";
import { AiResponseBody } from "./messages/AiResponseBody";
import { MessageActions } from "./messages/MessageActions";
import { SuggestedQuestions } from "./messages/SuggestedQuestions";

interface InitialSummaryProps {
  summary: string;
  insights: readonly string[] | null;
  suggestedQuestions: readonly string[] | null;
  onPickSuggestedQuestion: (q: string) => void;
}

export const InitialSummary: React.FC<InitialSummaryProps> = ({
  summary,
  insights,
  suggestedQuestions,
  onPickSuggestedQuestion,
}) => {
  const { t } = useTranslation();

  const hasInsights = insights !== null && insights.length > 0;
  const questions = suggestedQuestions ?? [];

  // Plain-text version of summary + insights for the clipboard, since
  // "Key insights" renders as structured JSX rather than inline markdown.
  const copyableContent = useMemo(() => {
    if (!hasInsights) return summary;

    const insightLines = (insights ?? []).map((i) => `- ${i}`).join("\n");

    return `${summary}\n\n${t("aiSummarizer.chat.keyInsightsTitle")}\n${insightLines}`;
  }, [summary, insights, hasInsights, t]);

  return (
    <AiMessageLayout>
      <p className="text-lg leading-[26px] font-semibold text-black/87">
        {t("aiSummarizer.chat.summaryTitle")}
      </p>
      <AiResponseBody content={summary} />
      {hasInsights && <KeyInsights insights={insights ?? []} />}
      {questions.length > 0 && (
        <SuggestedQuestions
          questions={questions}
          onPick={onPickSuggestedQuestion}
        />
      )}
      <MessageActions content={copyableContent} />
    </AiMessageLayout>
  );
};

const KeyInsights: React.FC<{ insights: readonly string[] }> = ({
  insights,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-2 pt-1">
      <p className="text-[15px] font-semibold text-black/87">
        {t("aiSummarizer.chat.keyInsightsTitle")}
      </p>
      <ul className="flex list-disc flex-col gap-1 ps-5 marker:text-[color:var(--color-primary)]">
        {insights.map((insight, idx) => (
          <li key={idx} className="text-[15px] leading-[21px] text-black/87">
            {insight}
          </li>
        ))}
      </ul>
    </div>
  );
};
