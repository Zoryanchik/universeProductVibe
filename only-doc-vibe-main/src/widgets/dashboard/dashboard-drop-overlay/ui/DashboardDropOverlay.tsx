import { useCallback, useEffect, useRef, useState, type FC } from "react";
import { cn } from "@universe-forma/ui-pes";

import { useTranslation } from "@/shared/lib/translations";
import {
  CloseIcon,
  ChevronDownIcon,
  UploadIcon,
} from "@/shared/ui/dashboard-icons";

import { setDropOverlayOpen, useDashboardStore } from "@/entities/documents";

import { useDashboardUpload } from "@/features/dashboard-upload";

const illustrationSrc = "/assets/icons/dashboard/document-with-mug.svg";
const FORMATS = ["PDF", "DOCX", "PPTX", "XLSX", "PNG", "JPEG"] as const;

const hasFiles = (e: DragEvent): boolean =>
  Array.from(e.dataTransfer?.types ?? []).includes("Files");

export const DashboardDropOverlay: FC = () => {
  const { t } = useTranslation();
  const active = useDashboardStore.use.isDropOverlayOpen();
  const { upload } = useDashboardUpload();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const onDragEnter = useCallback((e: DragEvent) => {
    if (!hasFiles(e)) return;

    e.preventDefault();
    setDropOverlayOpen(true);
  }, []);

  const onDragOver = useCallback((e: DragEvent) => {
    if (!hasFiles(e)) return;

    e.preventDefault();
  }, []);

  const onDragLeave = useCallback((e: DragEvent) => {
    if (e.relatedTarget === null || (e as unknown as { x: number }).x === 0) {
      setIsDraggingOver(false);
      setDropOverlayOpen(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
      setDropOverlayOpen(false);
      const dropped = Array.from(e.dataTransfer?.files ?? []);
      if (dropped.length === 0) return;

      void upload(dropped);
    },
    [upload]
  );

  useEffect(() => {
    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);

    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, [onDragEnter, onDragOver, onDragLeave, onDrop]);

  const onPickFiles = () => inputRef.current?.click();

  const onInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setDropOverlayOpen(false);
    await upload(files);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(0,0,0,0.3)] p-6">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={onInputChange}
      />

      {/* Centered card */}
      <div className="relative flex w-full max-w-[878px] flex-col rounded-[20px] bg-[rgba(0,0,0,0.4)] p-6 backdrop-blur-[20px]">
        {/* Close button — floats above the card top-right */}
        <button
          type="button"
          aria-label={String(t("dashboard.actions.close"))}
          onClick={() => setDropOverlayOpen(false)}
          className="absolute end-0 -top-14 flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(0,0,0,0.32)] text-white backdrop-blur-[8px] transition-colors hover:bg-[rgba(0,0,0,0.48)]"
        >
          <CloseIcon size={24} />
        </button>

        {/* Drop zone */}
        <div
          className={cn(
            "flex min-h-[380px] flex-col items-center justify-center gap-4 rounded-[16px] border-dashed px-8 py-14 transition-colors",
            isDraggingOver
              ? "border-2 border-[var(--color-primary)]"
              : "border-2 border-white"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
        >
          {/* Illustration */}
          <div className="relative h-[90px] w-[90px] shrink-0">
            <img
              src={illustrationSrc}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>

          {/* Text */}
          <div className="flex flex-col items-center gap-1 text-center text-white">
            {isDraggingOver ? (
              <p className="text-base leading-[22px] font-medium">
                {String(t("dashboard.drop.dropHere"))}
              </p>
            ) : (
              <>
                <p className="text-sm leading-[18px]">
                  {String(t("dashboard.drop.sizeLimit"))}
                </p>
                <p className="flex flex-wrap items-center justify-center gap-x-1 text-sm leading-[18px]">
                  <span>{String(t("dashboard.drop.formats"))}</span>
                  {FORMATS.map((fmt, i) => (
                    <span
                      key={fmt}
                      className="text-xs font-extrabold tracking-wide uppercase"
                    >
                      {fmt}
                      {i < FORMATS.length - 1 ? "," : ""}
                    </span>
                  ))}
                </p>
              </>
            )}
          </div>

          {/* Split "Add files" button — hidden while dragging */}
          {!isDraggingOver && (
            <div className="flex h-12 overflow-hidden rounded-xl bg-[var(--color-primary)] text-black">
              <button
                type="button"
                onClick={onPickFiles}
                className="flex cursor-pointer items-center gap-1.5 px-4 py-3 text-base font-medium transition-colors hover:bg-[rgba(0,0,0,0.06)]"
              >
                <UploadIcon size={20} />
                {String(t("dashboard.drop.addFiles"))}
              </button>
              <div className="my-3 w-px shrink-0 bg-[rgba(0,0,0,0.2)]" />
              <button
                type="button"
                onClick={onPickFiles}
                className="flex cursor-pointer items-center justify-center px-3 transition-colors hover:bg-[rgba(0,0,0,0.06)]"
              >
                <ChevronDownIcon size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
