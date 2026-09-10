import React from "react";

import { useTranslation } from "@/shared/lib/translations";

import { LoadingDot } from "@/features/aiSummarizer";

export const PdfPanelLoader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex gap-1.5">
        <LoadingDot delayMs={0} />
        <LoadingDot delayMs={150} />
        <LoadingDot delayMs={300} />
      </div>
      <p className="text-sm font-medium text-gray-900">
        {t("aiSummarizer.loader.loadingDocument")}
      </p>
    </div>
  );
};
