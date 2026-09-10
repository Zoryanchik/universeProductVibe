import React from "react";

import { useTranslation } from "@/shared/lib/translations";

interface NewChatButtonProps {
  onClick: () => void;
  label?: string;
}

export const NewChatButton: React.FC<NewChatButtonProps> = ({
  onClick,
  label,
}) => {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[color:var(--color-primary)] px-4 py-3 text-sm font-semibold text-[color:var(--color-primary-contrast-text)] transition-colors hover:bg-[color:var(--color-primary-dark)]"
    >
      <img
        src="/assets/icons/upload.svg"
        alt=""
        className="h-4 w-4 brightness-0"
        aria-hidden
      />
      {label ?? t("aiSummarizer.sidebar.newFile")}
    </button>
  );
};
