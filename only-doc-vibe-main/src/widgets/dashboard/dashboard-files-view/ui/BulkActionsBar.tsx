import { createPortal } from "react-dom";
import { useEffect, useState, type FC } from "react";

import { cn } from "@/shared/lib/utils/cn";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import { openModal } from "@/shared/lib/modals/modals-store";
import { useTranslation } from "@/shared/lib/translations";
import {
  CloseIcon,
  DownloadIcon,
  FilesIcon,
  TrashRedIcon,
} from "@/shared/ui/dashboard-icons";

import {
  clearDashboardSelected,
  useDashboardStore,
} from "@/entities/documents";

import { useDashboardActions } from "@/features/dashboard-actions";

export const BulkActionsBar: FC = () => {
  const { t } = useTranslation();
  const selectedIds = useDashboardStore.use.selectedIds();
  const files = useDashboardStore.use.files();
  const { downloadMany } = useDashboardActions();

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (selectedIds.length > 0) {
      const timer = setTimeout(() => setVisible(true), 10);

      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [selectedIds.length]);

  if (selectedIds.length === 0 || typeof document === "undefined") return null;

  const selectedFiles = files.filter((f) => selectedIds.includes(f.id));
  const selectedLabel = String(
    t("dashboard.bulk.selected", { count: selectedIds.length })
  );

  return createPortal(
    <div
      role="toolbar"
      aria-label={selectedLabel}
      className={cn(
        "fixed bottom-10 left-1/2 z-[9998] flex h-[60px] -translate-x-1/2 items-stretch gap-0 overflow-hidden rounded-2xl bg-white shadow-[0px_6px_12px_-2px_rgba(0,0,0,0.08),0px_8px_40px_rgba(0,0,0,0.08)]",
        "transition-[opacity,transform] duration-200 ease-in-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
    >
      {/* File count */}
      <div className="flex items-center gap-2 px-4">
        <span className="text-text-primary">
          <FilesIcon size={18} />
        </span>
        <span className="text-text-primary text-base leading-[22px] font-medium whitespace-nowrap">
          {selectedLabel}
        </span>
      </div>

      {/* Divider */}
      <div className="h-full w-px shrink-0 bg-[var(--color-os-divider)]" />

      {/* Download */}
      <button
        type="button"
        onClick={() => {
          void downloadMany(selectedFiles);
        }}
        className="text-text-primary flex h-full cursor-pointer items-center gap-1 px-4 text-sm leading-5 font-medium transition-colors hover:bg-[rgba(0,0,0,0.04)]"
      >
        <DownloadIcon size={18} />
        <span>{String(t("dashboard.actions.download"))}</span>
      </button>

      {/* TODO: Re-enable merge files feature once backend merge endpoint is implemented */}
      {/* <button
        type="button"
        onClick={() => {}}
        className="flex h-full cursor-pointer items-center gap-1 px-4 text-sm leading-5 font-medium text-[var(--color-primary)] transition-colors hover:bg-[rgba(3,143,123,0.06)]"
        style={{ color: "var(--color-primary)" }}
      >
        <MergeIcon />
        <span>Merge files</span>
      </button> */}

      {/* Delete */}
      <button
        type="button"
        onClick={() =>
          openModal({
            type: EModalsTypes.DASHBOARD_DELETE_FILES,
            options: {
              ids: selectedIds,
              filename:
                selectedIds.length === 1
                  ? files.find((f) => f.id === selectedIds[0])?.filename
                  : undefined,
            },
          })
        }
        className="flex h-full cursor-pointer items-center gap-1 px-4 text-sm leading-5 font-medium text-[var(--color-error-main)] transition-colors hover:bg-[rgba(244,67,54,0.06)]"
      >
        <TrashRedIcon size={18} />
        <span>{String(t("dashboard.actions.delete"))}</span>
      </button>

      {/* Divider */}
      <div className="h-full w-px shrink-0 bg-[var(--color-os-divider)]" />

      {/* Close */}
      <button
        type="button"
        onClick={clearDashboardSelected}
        aria-label={String(t("dashboard.bulk.clear"))}
        className="text-text-secondary flex h-full w-[72px] cursor-pointer items-center justify-center transition-colors hover:bg-[rgba(0,0,0,0.04)]"
      >
        <CloseIcon size={24} />
      </button>
    </div>,
    document.body
  );
};
