import React from "react";

import { useTranslation } from "@/shared/lib/translations";

import { AssistantAvatar } from "../AssistantAvatar";
import { LoadingDot } from "./LoadingDot";

interface AnalyzingLoaderProps {
  /** Show the "Analyzing your file..." label (default: true). */
  showText?: boolean;
}

export const AnalyzingLoader: React.FC<AnalyzingLoaderProps> = ({
  showText = true,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3">
      <AssistantAvatar size={40} />
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          <LoadingDot delayMs={0} />
          <LoadingDot delayMs={150} />
          <LoadingDot delayMs={300} />
        </div>
        {showText && (
          <span className="text-sm font-semibold text-gray-900">
            {t("aiSummarizer.loader.analyzing")}
          </span>
        )}
      </div>
    </div>
  );
};
