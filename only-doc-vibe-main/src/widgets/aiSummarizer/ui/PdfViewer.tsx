import React from "react";

import { useAiSummarizerStore } from "@/features/aiSummarizer";

export const PdfViewer: React.FC = () => {
  const currentFileUrl = useAiSummarizerStore.use.currentFileUrl();
  const fileName = useAiSummarizerStore.use.fileName();

  if (!currentFileUrl) return null;

  return (
    <iframe
      src={currentFileUrl}
      title={fileName ?? "PDF preview"}
      className="flex-1 border-0 bg-gray-50"
    />
  );
};
