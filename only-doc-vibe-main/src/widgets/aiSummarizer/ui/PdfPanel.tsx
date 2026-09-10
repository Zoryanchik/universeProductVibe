import React from "react";

import { useAiSummarizerStore } from "@/features/aiSummarizer";

import { PdfViewer } from "./PdfViewer";
import { EmptyPdfPanel } from "./EmptyPdfPanel";
import { PdfPanelLoader } from "./PdfPanelLoader";

interface PdfPanelProps {
  onUpload: () => void;
  hiddenOnMobile?: boolean;
}

export const PdfPanel: React.FC<PdfPanelProps> = ({
  onUpload,
  hiddenOnMobile = false,
}) => {
  const currentFileUrl = useAiSummarizerStore.use.currentFileUrl();
  const status = useAiSummarizerStore.use.status();

  // While a chat is being switched/loaded, the store is reset to clear the
  // previous preview before the new one arrives. Without this branch the
  // panel would flash the "Upload your file" empty state in between.
  const isLoadingDocument = !currentFileUrl && status === "waiting";

  const renderContent = () => {
    if (currentFileUrl) return <PdfViewer />;

    if (isLoadingDocument) return <PdfPanelLoader />;

    return <EmptyPdfPanel onUpload={onUpload} />;
  };

  return (
    <div
      className={[
        "flex-1 overflow-hidden bg-[#FAFAFA] md:flex",
        hiddenOnMobile ? "hidden" : "flex",
      ].join(" ")}
    >
      {renderContent()}
    </div>
  );
};
