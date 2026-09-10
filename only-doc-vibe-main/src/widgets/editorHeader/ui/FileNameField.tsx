import React, { useEffect, useRef, useState } from "react";
import { cn } from "@universe-forma/ui-pes";

import { useTranslation } from "@/shared/lib/translations/useTranslation";

interface FileNameFieldProps {
  value: string;
  onChange: (next: string) => void;
}

export const FileNameField: React.FC<FileNameFieldProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onChange(trimmed);
    } else {
      setDraft(value);
    }

    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-2 text-white">
      {isEditing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();

            if (e.key === "Escape") {
              setDraft(value);
              setIsEditing(false);
            }
          }}
          className="rounded border border-white/20 bg-transparent px-2 py-1 text-sm outline-none focus:border-[var(--color-primary)]"
        />
      ) : (
        <span className="truncate text-sm font-medium">{value}</span>
      )}
      <button
        type="button"
        onClick={() => setIsEditing((s) => !s)}
        aria-label={String(t("editor_page.header.edit_file_name"))}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded text-white/70 transition-colors",
          "hover:bg-white/10 hover:text-white"
        )}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
    </div>
  );
};
