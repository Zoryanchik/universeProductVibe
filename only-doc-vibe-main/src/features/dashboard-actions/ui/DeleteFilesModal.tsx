import { useRef, useState, type FC } from "react";
import { cn } from "@universe-forma/ui-pes";

import { TrashWhiteIcon } from "@/shared/ui/dashboard-icons";
import { BaseModal } from "@/shared/ui/base-modal/BaseModal";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import {
  closeModal,
  useCurrentModalOptions,
} from "@/shared/lib/modals/modals-store";
import { showToast } from "@/shared/lib/toast/toast-store";
import { useTranslation } from "@/shared/lib/translations";
import { logger } from "@/shared/lib/utils/logger";
import type { IDashboardDeleteModalOptions } from "@/shared/lib/modals/dashboard-modal-options";

import {
  deleteFile,
  bulkDeleteFiles,
  removeDashboardFiles,
  restoreDashboardFiles,
  useDashboardStore,
} from "@/entities/documents";
export type { IDashboardDeleteModalOptions } from "@/shared/lib/modals/dashboard-modal-options";

const UNDO_DURATION_MS = 5000;

export const DashboardDeleteModal: FC = () => {
  const { t } = useTranslation();
  const options = useCurrentModalOptions(
    EModalsTypes.DASHBOARD_DELETE_FILES
  ) as IDashboardDeleteModalOptions | null;
  const [busy, setBusy] = useState(false);
  const files = useDashboardStore.use.files();
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!options || options.ids.length === 0) return null;

  const isBulk = options.ids.length > 1;

  const handleConfirm = () => {
    if (busy) return;

    setBusy(true);

    const idsToDelete = [...options.ids];
    const snapshot = files.filter((f) => idsToDelete.includes(f.id));
    const originalFiles = [...files];

    removeDashboardFiles(idsToDelete);
    closeModal(EModalsTypes.DASHBOARD_DELETE_FILES);
    setBusy(false);

    let undone = false;

    const commitDelete = () => {
      if (undone) return;

      const doDelete = async () => {
        try {
          if (idsToDelete.length === 1) {
            await deleteFile(idsToDelete[0]);
          } else {
            await bulkDeleteFiles(idsToDelete);
          }
        } catch (error) {
          logger.error("Failed to delete file(s)", error);
          restoreDashboardFiles(snapshot, originalFiles);
        }
      };
      void doDelete();
    };

    const handleUndo = () => {
      undone = true;
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
        deleteTimerRef.current = null;
      }

      restoreDashboardFiles(snapshot, originalFiles);
    };

    deleteTimerRef.current = setTimeout(commitDelete, UNDO_DURATION_MS);

    const message = isBulk
      ? String(t("dashboard.toast.filesDeleted"))
      : String(t("dashboard.toast.fileDeleted"));

    showToast(message, {
      type: "info",
      icon: "info",
      position: "bottom",
      duration: UNDO_DURATION_MS,
      action: {
        label: String(t("dashboard.toast.undo")),
        onClick: handleUndo,
      },
    });
  };

  const bodyText =
    isBulk || !options.filename
      ? String(t("dashboard.delete.subtitleMany"))
      : String(t("dashboard.delete.subtitle", { filename: options.filename }));

  return (
    <BaseModal
      modalType={EModalsTypes.DASHBOARD_DELETE_FILES}
      headerTitle={String(
        isBulk
          ? t("dashboard.delete.titleMany", { count: options.ids.length })
          : t("dashboard.delete.title")
      )}
      headerSubtitle={isBulk ? undefined : (options.filename ?? undefined)}
      headerAlign="left"
      className="w-full max-w-[592px]"
    >
      {/* Body */}
      <div className="px-[24px] py-6">
        <p className="text-text-primary text-lg leading-[26px]">{bodyText}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 pt-3 pb-5">
        <button
          type="button"
          onClick={() => closeModal(EModalsTypes.DASHBOARD_DELETE_FILES)}
          disabled={busy}
          className={cn(
            "flex min-h-[48px] cursor-pointer items-center justify-center rounded-xl border border-[rgba(0,0,0,0.2)] px-4 py-3 text-base leading-6 font-medium transition-colors",
            "text-text-primary hover:bg-[rgba(0,0,0,0.04)]",
            busy && "cursor-not-allowed opacity-50"
          )}
        >
          {String(t("dashboard.actions.close"))}
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={busy}
          className={cn(
            "flex min-h-[48px] cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-base leading-6 font-medium text-white transition-colors",
            "bg-[#f44336] hover:bg-[#d32f2f]",
            busy && "cursor-not-allowed opacity-70"
          )}
        >
          <TrashWhiteIcon size={20} />
          {String(t("dashboard.delete.confirm"))}
        </button>
      </div>
    </BaseModal>
  );
};
