import React from "react";

import { useTranslation } from "@/shared/lib/translations";

interface EmptyPdfPanelProps {
  onUpload: () => void;
}

export const EmptyPdfPanel: React.FC<EmptyPdfPanelProps> = ({ onUpload }) => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center px-6 text-center">
      <img
        src="/assets/illustrations/empty-folder.png"
        alt=""
        width={270}
        height={267}
        className="h-auto w-[270px]"
        aria-hidden
      />
      <p className="mt-6 max-w-md text-center text-base text-gray-700">
        {t("aiSummarizer.empty.headline")}
      </p>
      <button
        type="button"
        onClick={onUpload}
        className="mt-5 flex cursor-pointer items-center gap-2 rounded-xl bg-[color:var(--color-primary)] px-7 py-3.5 text-base font-semibold text-[color:var(--color-primary-contrast-text)] transition-colors hover:bg-[color:var(--color-primary-dark)]"
      >
        <img
          src="/assets/icons/upload.svg"
          alt=""
          className="h-5 w-5 brightness-0"
          aria-hidden
        />
        {t("aiSummarizer.empty.uploadButton")}
      </button>
    </div>
  );
};
