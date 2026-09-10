import React from "react";

import { useTranslation } from "@/shared/lib/translations";

interface ChatLoadErrorProps {
  onRetry: () => void;
}

export const ChatLoadError: React.FC<ChatLoadErrorProps> = ({ onRetry }) => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm text-red-600">
        {t("aiSummarizer.errors.processingFailed")}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="cursor-pointer rounded-lg border border-[color:var(--color-primary)] px-4 py-2 text-sm font-semibold text-[color:var(--color-primary)] transition-colors hover:bg-[color:var(--color-state-primary-hover)]"
      >
        {t("aiSummarizer.empty.uploadButton")}
      </button>
    </div>
  );
};
