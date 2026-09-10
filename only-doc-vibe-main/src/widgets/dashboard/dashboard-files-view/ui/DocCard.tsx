import type { FC } from "react";
import { cn } from "@universe-forma/ui-pes";

import { useTranslation, getCurrentLanguage } from "@/shared/lib/translations";
import { CheckIcon } from "@/shared/ui/dashboard-icons";

import type { IUserFile } from "@/entities/documents";
import {
  formatBytes,
  formatDate,
  getExtension,
  getFormatGroupForType,
  FORMAT_GROUP_BADGE_ICON,
  setDashboardPreviewFileId,
  toggleDashboardFileSelected,
  useDashboardStore,
} from "@/entities/documents";

import { FilePreviewThumbnail } from "./FilePreviewThumbnail";
import { RowActions } from "./RowActions";

interface Props {
  file: IUserFile;
}

export const DocCard: FC<Props> = ({ file }) => {
  const { t } = useTranslation();
  const selectedIds = useDashboardStore.use.selectedIds();
  const previewFileId = useDashboardStore.use.previewFileId();
  const selected = selectedIds.includes(file.id);
  const previewing = previewFileId === file.id;

  const group = getFormatGroupForType(file.internal_type);
  const badgeIcon = FORMAT_GROUP_BADGE_ICON[group];
  const ext = getExtension(file.filename) || file.internal_type;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setDashboardPreviewFileId(file.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter") setDashboardPreviewFileId(file.id);
      }}
      className={cn(
        "group flex cursor-pointer flex-col gap-[10px] rounded-2xl px-2 pt-2 pb-2.5 transition-all",
        selected || previewing
          ? "bg-[var(--color-primary-opacity-8)]"
          : "bg-bg-white-bg hover:shadow-[0px_4px_16px_rgba(0,0,0,0.10)]"
      )}
    >
      {/* Preview area — matches Figma: bg-[#f5f5f5], border, rounded-xl, h-[200px], pt-4 px-4 pb-0 */}
      <div className="relative flex h-[200px] items-start justify-center overflow-hidden rounded-xl border border-[#eeeeee] bg-[#f5f5f5] px-4 pt-4 pb-0">
        {/* File preview inside white-elevated paper */}
        <div className="relative h-full min-w-0 flex-1 overflow-hidden shadow-[0px_0px_8px_3px_rgba(0,0,0,0.08)]">
          <FilePreviewThumbnail file={file} fillContainer />
        </div>

        {/* Checkbox — hidden until hover/selected */}
        <div
          className={cn(
            "absolute start-[-1px] top-[-1px] z-10 rounded-xl p-2.5 transition-opacity",
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            role="checkbox"
            aria-checked={selected}
            aria-label={String(
              t("dashboard.bulk.toggleRow", { filename: file.filename })
            )}
            onClick={() => toggleDashboardFileSelected(file.id)}
            className={cn(
              "flex h-7 w-7 cursor-pointer items-center justify-center rounded bg-[rgba(255,255,255,0.75)] p-0.5 backdrop-blur-[2px] transition-colors",
              selected
                ? "text-black"
                : "text-transparent hover:text-[var(--color-primary)]"
            )}
          >
            <span
              className={cn(
                "flex h-full w-full items-center justify-center rounded-[5px] border transition-colors",
                selected
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                  : "border-[rgba(0,0,0,0.24)] bg-white"
              )}
            >
              <CheckIcon size={12} filled />
            </span>
          </button>
        </div>

        {/* Row actions — hidden until hover */}
        <div
          className="absolute end-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100 max-md:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <RowActions
            file={file}
            className="rounded-lg bg-white p-0.5 shadow-[0px_2px_6px_rgba(0,0,0,0.1)]"
          />
        </div>

        {/* Pages badge — only shown when more than 1 page */}
        {file.pages != null && file.pages > 1 && (
          <div className="absolute end-[7px] bottom-[7px] z-10 flex items-center gap-1 rounded-lg bg-[rgba(0,0,0,0.75)] py-[2px] ps-[8px] pe-[6px] backdrop-blur-[30px]">
            <span className="text-[13px] leading-4 font-semibold text-[#eeeeee]">
              {file.pages}
            </span>
            <span className="text-[13px] leading-4 font-semibold text-[#9e9e9e]">
              / {file.pages}
            </span>
          </div>
        )}
      </div>

      {/* Text info area */}
      <div className="flex flex-col gap-0.5 ps-2 pb-1">
        {/* Filename */}
        <p className="text-text-primary overflow-hidden text-[15px] leading-[22px] font-semibold text-ellipsis whitespace-nowrap">
          {file.filename}
        </p>

        {/* Format badge + date + size */}
        <div className="flex items-center gap-1.5">
          <img
            src={badgeIcon}
            alt={ext.toUpperCase()}
            className="h-3 w-3 shrink-0 rounded-[3px]"
          />
          <span className="text-text-secondary text-[8px] leading-[18px]">
            •
          </span>
          <span className="text-text-secondary truncate text-sm leading-[18px]">
            {formatDate(file.created_at, getCurrentLanguage())}
          </span>
          <span className="text-text-secondary text-[8px] leading-[18px]">
            •
          </span>
          <span className="text-text-secondary shrink-0 text-sm leading-[18px]">
            {formatBytes(file.size)}
          </span>
        </div>
      </div>
    </div>
  );
};
