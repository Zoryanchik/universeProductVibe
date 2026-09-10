import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@universe-forma/ui-pes";

import { useTranslation } from "@/shared/lib/translations/useTranslation";

import type { MergeItem } from "../model/useMergeWindow";

interface MergeFileCardProps {
  item: MergeItem;
  index: number;
  currentDocumentLabel: string;
  onRemove: (id: string) => void;
}

export const MergeFileCard: React.FC<MergeFileCardProps> = ({
  item,
  index,
  currentDocumentLabel,
  onRemove,
}) => {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const pageCountLabel =
    item.pageCount === 1
      ? String(t("editor_page.merge_modal.page_count_one"))
      : String(
          t("editor_page.merge_modal.page_count", { count: item.pageCount })
        );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#2A2D33] transition-shadow",
        isDragging ? "z-10 opacity-80 shadow-2xl" : "hover:border-white/25"
      )}
    >
      <span className="absolute start-2 top-2 z-10 flex h-6 min-w-6 items-center justify-center rounded-full bg-black/60 px-1.5 text-xs font-medium text-white">
        {index + 1}
      </span>

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        aria-label={String(t("editor_page.merge_modal.remove_file"))}
        className="absolute end-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/80 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/80 hover:text-white focus-visible:opacity-100"
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
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div
        {...attributes}
        {...listeners}
        className="flex aspect-[3/4] cursor-grab items-center justify-center bg-[#1A1C1E] p-3 active:cursor-grabbing"
      >
        {item.previewUrl ? (
          <img
            src={item.previewUrl}
            alt={item.file.name}
            className="max-h-full max-w-full rounded-sm object-contain shadow-lg"
            draggable={false}
          />
        ) : (
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/30"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        )}
      </div>

      <div className="flex flex-col gap-0.5 border-t border-white/10 px-3 py-2">
        <span
          className="truncate text-sm font-medium text-white"
          title={item.file.name}
        >
          {item.file.name}
        </span>
        <span className="text-xs text-white/50">
          {item.isCurrentDocument ? currentDocumentLabel : pageCountLabel}
        </span>
      </div>
    </div>
  );
};
