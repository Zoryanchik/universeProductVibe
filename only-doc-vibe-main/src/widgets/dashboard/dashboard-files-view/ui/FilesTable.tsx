import type { FC, Ref } from "react";
import { cn } from "@universe-forma/ui-pes";

const CheckMark = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="m9.55 17.65-5.2-5.2 1.4-1.4 3.8 3.8 8.7-8.7 1.4 1.4-10.1 10.1Z"
      fill="black"
    />
  </svg>
);

interface CbProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  ariaLabel: string;
  cbRef?: Ref<HTMLInputElement>;
  className?: string;
}

const Cb: FC<CbProps> = ({
  checked,
  indeterminate = false,
  onChange,
  ariaLabel,
  cbRef,
  className,
}) => (
  <label className={cn("relative flex h-4 w-4 cursor-pointer", className)}>
    <input
      type="checkbox"
      ref={cbRef}
      checked={checked}
      onChange={onChange}
      aria-label={ariaLabel}
      className="sr-only"
    />
    <span
      className={cn(
        "flex h-4 w-4 items-center justify-center rounded-[5px] border transition-colors",
        checked || indeterminate
          ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
          : "border-[rgba(0,0,0,0.24)] bg-white"
      )}
    >
      {checked && <CheckMark />}
      {!checked && indeterminate && (
        <div className="h-0.5 w-2 rounded-full bg-white" />
      )}
    </span>
  </label>
);

import { useTranslation, getCurrentLanguage } from "@/shared/lib/translations";
import {
  DownloadIcon,
  EyeIcon,
  SortArrowsIcon,
} from "@/shared/ui/dashboard-icons";

import type { IUserFile } from "@/entities/documents";
import {
  formatBytes,
  formatDate,
  EDashboardSort,
  setDashboardPreviewFileId,
  setDashboardSelectedIds,
  setDashboardSort,
  toggleDashboardFileSelected,
  useDashboardStore,
} from "@/entities/documents";

import { useDashboardActions } from "@/features/dashboard-actions";

import { FilePreviewThumbnail } from "./FilePreviewThumbnail";
import { RowActions } from "./RowActions";

interface Props {
  files: IUserFile[];
}

interface SortableHeaderProps {
  label: string;
  ascSort: EDashboardSort;
  descSort: EDashboardSort;
  className?: string;
}

const SortableHeader: FC<SortableHeaderProps> = ({
  label,
  ascSort,
  descSort,
  className,
}) => {
  const sort = useDashboardStore.use.sort();
  const isActive = sort === ascSort || sort === descSort;

  return (
    <button
      type="button"
      onClick={() => setDashboardSort(sort === descSort ? ascSort : descSort)}
      className={cn(
        "text-text-secondary flex cursor-pointer items-center gap-1.5 text-sm font-normal",
        isActive && "text-text-primary",
        className
      )}
    >
      <span>{label}</span>
      <SortArrowsIcon size={13} />
    </button>
  );
};

export const FilesTable: FC<Props> = ({ files }) => {
  const { t } = useTranslation();
  const { downloadOne } = useDashboardActions();
  const selectedIds = useDashboardStore.use.selectedIds();
  const previewFileId = useDashboardStore.use.previewFileId();

  const previewOpen = !!previewFileId;
  const allSelected = files.length > 0 && selectedIds.length === files.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const onToggleAll = () => {
    if (allSelected) {
      setDashboardSelectedIds([]);
    } else {
      setDashboardSelectedIds(files.map((f) => f.id));
    }
  };

  // Hide Size/Updated when preview panel is open (table becomes narrower)
  const secondaryColCls = cn(
    "border-b border-[var(--color-os-divider)] px-4 py-3 text-start",
    previewOpen ? "hidden" : "hidden md:table-cell"
  );

  // Header-only variant — adds a short centered divider via absolute positioning
  const headerSecondaryColCls = cn(secondaryColCls, "relative");

  return (
    <div>
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="group/hdr w-12 border-b border-[var(--color-os-divider)] px-4 py-3 text-start max-md:hidden">
              <Cb
                checked={allSelected}
                indeterminate={someSelected}
                cbRef={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={onToggleAll}
                ariaLabel={String(t("dashboard.bulk.selectAll"))}
                className={cn(
                  !allSelected &&
                    !someSelected &&
                    "opacity-0 transition-opacity group-hover/hdr:opacity-100"
                )}
              />
            </th>
            <th className="border-b border-[var(--color-os-divider)] px-4 py-3 text-start">
              <SortableHeader
                label={String(t("dashboard.table.name"))}
                ascSort={EDashboardSort.NAME_ASC}
                descSort={EDashboardSort.NAME_DESC}
              />
            </th>
            <th className={cn(headerSecondaryColCls, "w-32")}>
              <div
                aria-hidden
                className="absolute start-0 top-1/2 h-4 w-px -translate-y-1/2 bg-[rgba(0,0,0,0.1)]"
              />
              <SortableHeader
                label={String(t("dashboard.table.size"))}
                ascSort={EDashboardSort.SIZE_ASC}
                descSort={EDashboardSort.SIZE_DESC}
              />
            </th>
            <th className={cn(headerSecondaryColCls, "w-40")}>
              <div
                aria-hidden
                className="absolute start-0 top-1/2 h-4 w-px -translate-y-1/2 bg-[rgba(0,0,0,0.1)]"
              />
              <SortableHeader
                label={String(t("dashboard.table.updated"))}
                ascSort={EDashboardSort.DATE_ASC}
                descSort={EDashboardSort.DATE_DESC}
              />
            </th>
            <th
              className={cn(
                "w-[88px] border-b border-[var(--color-os-divider)] px-2 py-3",
                previewOpen ? "md:w-[100px]" : "md:w-[220px]"
              )}
            />
          </tr>
        </thead>
        <tbody>
          {files.map((file) => {
            const selected = selectedIds.includes(file.id);
            const previewing = previewFileId === file.id;

            return (
              <tr
                key={file.id}
                onClick={() =>
                  setDashboardPreviewFileId(previewing ? null : file.id)
                }
                className={cn(
                  "group/row cursor-pointer transition-colors",
                  selected || previewing
                    ? "bg-[var(--color-primary-opacity-8)]"
                    : "hover:bg-[rgba(0,0,0,0.04)]"
                )}
              >
                <td
                  className="w-12 border-b border-[var(--color-os-divider)] px-4 py-3 align-middle max-md:hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Cb
                    checked={selected}
                    onChange={() => toggleDashboardFileSelected(file.id)}
                    ariaLabel={String(
                      t("dashboard.bulk.toggleRow", { filename: file.filename })
                    )}
                    className={cn(
                      !selected &&
                        "opacity-0 transition-opacity group-hover/row:opacity-100"
                    )}
                  />
                </td>
                <td className="text-text-primary border-b border-[var(--color-os-divider)] px-4 py-3 align-middle">
                  <div className="flex items-center gap-3">
                    <FilePreviewThumbnail file={file} size={56} />
                    <span className="line-clamp-2 text-sm font-medium break-all">
                      {file.filename}
                    </span>
                  </div>
                </td>
                <td
                  className={cn(
                    secondaryColCls,
                    "text-text-secondary align-middle text-sm"
                  )}
                >
                  {formatBytes(file.size)}
                </td>
                <td
                  className={cn(
                    secondaryColCls,
                    "text-text-secondary align-middle text-sm"
                  )}
                >
                  {formatDate(file.created_at, getCurrentLanguage())}
                </td>

                {/* ── Row actions cell ── */}
                <td
                  className="border-b border-[var(--color-os-divider)] px-2 py-3 align-middle"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-end gap-1">
                    {/* Download pill — hover only, hidden when this row is being previewed */}
                    {!previewing && (
                      <button
                        type="button"
                        onClick={() => {
                          void downloadOne(file);
                        }}
                        className="text-text-secondary flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 opacity-0 transition-all group-hover/row:opacity-100 hover:bg-black hover:text-white max-md:hidden"
                        aria-label={String(t("dashboard.actions.download"))}
                      >
                        <DownloadIcon size={16} />
                        {!previewOpen && (
                          <span className="text-sm font-medium whitespace-nowrap">
                            {String(t("dashboard.actions.download"))}
                          </span>
                        )}
                      </button>
                    )}

                    {/* Preview eye icon — always visible when previewing, hover-only otherwise */}
                    <button
                      type="button"
                      onClick={() =>
                        setDashboardPreviewFileId(previewing ? null : file.id)
                      }
                      className={cn(
                        "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-all max-md:hidden",
                        previewing
                          ? "text-[var(--color-primary)] opacity-100 hover:bg-[var(--color-primary-opacity-8)]"
                          : "text-text-secondary hover:text-text-primary opacity-0 group-hover/row:opacity-100 hover:bg-[rgba(0,0,0,0.06)]"
                      )}
                      aria-label={String(t("dashboard.actions.preview"))}
                    >
                      <EyeIcon size={18} />
                    </button>

                    {/* Separator between eye/download and tools/dots */}
                    <div
                      aria-hidden
                      className={cn(
                        "mx-0.5 h-6 w-0.5 shrink-0 bg-[var(--color-os-divider)] max-md:hidden",
                        !previewing &&
                          "opacity-0 transition-opacity group-hover/row:opacity-100"
                      )}
                    />

                    {/* Tools + three-dots — always visible */}
                    <RowActions file={file} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
