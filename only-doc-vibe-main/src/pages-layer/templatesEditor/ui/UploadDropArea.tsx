import {
  useCallback,
  useMemo,
  useRef,
  type ChangeEvent,
  type DragEvent,
  type FC,
} from "react";

import { cn } from "@/shared/lib/utils/cn";
import { useTranslation } from "@/shared/lib/translations";

import { useTemplatesEditorStore } from "../model/store/templates-editor-store";

const DROPZONE_BG_DEFAULT =
  "[background-image:url(\"data:image/svg+xml,%3csvg%20width='100%25'%20height='100%25'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='100%25'%20height='100%25'%20fill='none'%20rx='16'%20ry='16'%20stroke='%23757575'%20stroke-width='1'%20stroke-dasharray='8%2c8'%20stroke-linecap='square'/%3e%3c/svg%3e\")]";
const DROPZONE_BG_HOVER =
  "hover:[background-image:url(\"data:image/svg+xml,%3csvg%20width='100%25'%20height='100%25'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='100%25'%20height='100%25'%20fill='none'%20rx='16'%20ry='16'%20stroke='%235f30e280'%20stroke-width='1'%20stroke-dasharray='8%2c8'%20stroke-linecap='square'/%3e%3c/svg%3e\")]";

function parseFormatExtensions(formats: string): string[] {
  return formats
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .map((ext) => (ext.startsWith("./UploadDropArea") ? ext.slice(1) : ext));
}

function fileExtensionMatches(file: File, allowed: string[]): boolean {
  if (allowed.length === 0) return true;

  const dot = file.name.lastIndexOf("./UploadDropArea");
  const ext = dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : "";

  return allowed.includes(ext);
}

export interface UploadDropAreaProps {
  tool: "text" | "photo";
  from?: "upload";
  maxSize: number;
  formats: string;
  buttonLabel?: string;
  onFileUpload: (files: File[]) => void;
}

export const UploadDropArea: FC<UploadDropAreaProps> = ({
  maxSize,
  formats,
  onFileUpload,
}) => {
  const { t } = useTranslation();
  const showToast = useTemplatesEditorStore.use.showToast();

  const inputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = useMemo(
    () => parseFormatExtensions(formats),
    [formats]
  );
  const acceptAttr = useMemo(
    () => allowedExtensions.map((ext) => `.${ext}`).join(","),
    [allowedExtensions]
  );

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const maxBytes = maxSize * 1024 * 1024;
      const valid = Array.from(fileList).filter(
        (file) =>
          fileExtensionMatches(file, allowedExtensions) && file.size <= maxBytes
      );
      const invalid = Array.from(fileList).filter(
        (file) =>
          !fileExtensionMatches(file, allowedExtensions) || file.size > maxBytes
      );
      if (invalid.length > 0) {
        showToast({
          id: "file-too-large",
          header: t("templatesEditor.toasts.file_too_large_header") as string,
          content: t("templatesEditor.toasts.file_too_large_content", {
            maxSize,
          }) as string,
          variant: "danger",
          button: {
            label: t("templatesEditor.common.try_again") as string,
            onClick: () => {
              inputRef.current?.click();
            },
          },
        });
      }

      if (valid.length > 0) onFileUpload(valid);
    },
    [allowedExtensions, maxSize, onFileUpload, showToast, t]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) handleFiles(files);

      e.target.value = "";
    },
    [handleFiles]
  );

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div className="box-border flex w-full shrink-0 flex-col items-center gap-6 px-5">
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleChange}
        accept={acceptAttr}
        className="hidden"
      />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={openFilePicker}
        className={cn(
          "group box-border flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl p-6",
          DROPZONE_BG_DEFAULT,
          DROPZONE_BG_HOVER
        )}
      >
        <div className="flex w-full items-center justify-center gap-1">
          <span className="material-symbols-rounded text-[20px] text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)]">
            upload
          </span>
          <span className="font-[Outfit,sans-serif] text-[16px] leading-[22px] font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)]">
            <span className="underline">
              {t("templatesEditor.upload.cta_highlight")}
            </span>
            <span>{t("templatesEditor.upload.cta_rest")}</span>
          </span>
        </div>
        <p className="m-0 w-full text-center font-[Outfit,sans-serif] text-[13px] leading-4 font-semibold text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)]">
          {t("templatesEditor.upload.size_support", {
            maxSize,
            formats: formats.toUpperCase(),
          })}
        </p>
      </div>
    </div>
  );
};
