import React, { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { Button, Input, cn } from "@universe-forma/ui-pes";

import { useTranslation } from "@/shared/lib/translations/useTranslation";

import { useEditor } from "@/features/editor/@x/editor-document-actions";

import { useMergeWindow } from "../model/useMergeWindow";
import { MergeFileCard } from "./MergeFileCard";

export const MergeWindow: React.FC = () => {
  const { t } = useTranslation();
  const { isMergeOpen } = useEditor();
  const {
    items,
    isSeeding,
    isMerging,
    error,
    invalidWarning,
    outputName,
    setOutputName,
    addFiles,
    removeItem,
    moveItem,
    submitMerge,
    closeMerge,
    canMerge,
    canAddMore,
  } = useMergeWindow();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  useEffect(() => {
    if (!isMergeOpen) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMerge();
    };
    document.addEventListener("keydown", handler);

    return () => document.removeEventListener("keydown", handler);
  }, [isMergeOpen, closeMerge]);

  const handleFilePick = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        void addFiles(event.target.files);
      }

      event.target.value = "";
    },
    [addFiles]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        moveItem(String(active.id), String(over.id));
      }
    },
    [moveItem]
  );

  const currentDocumentLabel = String(
    t("editor_page.merge_modal.current_document")
  );

  if (!isMergeOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1000] flex flex-col bg-[#1A1C1E]"
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-[#1F2125] px-6 py-4">
        <h2 className="text-lg font-semibold text-white">
          {String(t("editor_page.merge_modal.title"))}
        </h2>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outlined"
            size="md"
            onClick={() => fileInputRef.current?.click()}
            disabled={isMerging || !canAddMore}
          >
            {String(t("editor_page.merge_modal.add_files"))}
          </Button>
          <Button
            type="button"
            size="md"
            onClick={() => void submitMerge()}
            disabled={!canMerge || isMerging || isSeeding}
          >
            {isMerging
              ? String(t("editor_page.merge_modal.preparing"))
              : String(t("editor_page.merge_modal.merge"))}
          </Button>
          <button
            type="button"
            onClick={closeMerge}
            aria-label={String(t("editor_page.merge_modal.close"))}
            className="flex h-9 w-9 items-center justify-center rounded text-white/60 hover:bg-white/10 hover:text-white"
          >
            <svg
              width="18"
              height="18"
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
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-white/10 bg-[#1F2125] px-6 py-3">
        <p className="text-sm text-white/60">
          {String(t("editor_page.merge_modal.reorder_hint"))}
        </p>

        <div className="flex items-center gap-2 sm:ms-auto">
          <label
            htmlFor="merge-window-filename"
            className="text-sm font-medium text-white/70"
          >
            {String(t("editor_page.merge_modal.file_name"))}
          </label>
          <Input
            id="merge-window-filename"
            size="dense"
            bg="filled"
            value={outputName}
            onChange={(e) => setOutputName(e.target.value)}
            placeholder={String(
              t("editor_page.merge_modal.file_name_placeholder")
            )}
            className="w-56 border-white/10 bg-[#2A2D33] text-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {invalidWarning && (
          <p className="mb-4 rounded-md border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-sm text-amber-300">
            {invalidWarning}
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-md border border-red-500/30 bg-red-950/20 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        {isSeeding && (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-white/60">
              {String(t("editor_page.merge_modal.seeding"))}
            </span>
          </div>
        )}

        {!isSeeding && items.length === 0 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex h-full min-h-[240px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/15 text-sm text-white/50",
              "hover:border-white/30 hover:bg-white/[0.03]"
            )}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {String(t("editor_page.merge_modal.empty"))}
          </button>
        )}

        {!isSeeding && items.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {items.map((item, index) => (
                  <MergeFileCard
                    key={item.id}
                    item={item}
                    index={index}
                    currentDocumentLabel={currentDocumentLabel}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        className="hidden"
        onChange={handleFilePick}
      />
    </div>,
    document.body
  );
};
