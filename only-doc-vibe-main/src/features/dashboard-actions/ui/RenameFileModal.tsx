import { useEffect, useState, type FC, type FormEvent } from "react";
import { cn } from "@universe-forma/ui-pes";

import { PenFilledIcon } from "@/shared/ui/dashboard-icons";
import { BaseModal } from "@/shared/ui/base-modal/BaseModal";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import {
  closeModal,
  useCurrentModalOptions,
} from "@/shared/lib/modals/modals-store";
import { useTranslation } from "@/shared/lib/translations";
import type { IDashboardRenameModalOptions } from "@/shared/lib/modals/dashboard-modal-options";

import { getExtension, stripExtension } from "@/entities/documents";

import { useDashboardActions } from "../model/use-dashboard-actions";

export type { IDashboardRenameModalOptions } from "@/shared/lib/modals/dashboard-modal-options";

export const DashboardRenameModal: FC = () => {
  const { t } = useTranslation();
  const options = useCurrentModalOptions(
    EModalsTypes.DASHBOARD_RENAME_FILE
  ) as IDashboardRenameModalOptions | null;
  const [value, setValue] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const { rename } = useDashboardActions();

  useEffect(() => {
    if (options) {
      setValue(stripExtension(options.filename));
      setBusy(false);
    }
  }, [options?.fileId]);

  if (!options) return null;

  const ext = getExtension(options.filename);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || busy) return;

    setBusy(true);
    const finalName = ext ? `${value.trim()}.${ext}` : value.trim();
    const ok = await rename(options.fileId, finalName);
    setBusy(false);
    if (ok) closeModal(EModalsTypes.DASHBOARD_RENAME_FILE);
  };

  return (
    <BaseModal
      modalType={EModalsTypes.DASHBOARD_RENAME_FILE}
      headerTitle={String(t("dashboard.rename.title"))}
      headerSubtitle={options.filename}
      headerAlign="left"
      className="w-full max-w-[592px]"
    >
      <form onSubmit={handleSubmit}>
        {/* Input */}
        <div className="px-6 pb-6">
          <label className="mb-1 block text-[13px] leading-[14px] font-light text-[rgba(0,0,0,0.6)]">
            {String(t("dashboard.rename.newNameLabel"))}
          </label>
          <div className="flex min-h-[56px] items-center gap-2 rounded-xl border border-[rgba(0,0,0,0.14)] px-3 py-4 focus-within:border-[var(--color-primary)]">
            <PenFilledIcon
              size={18}
              className="shrink-0 text-[var(--color-primary)]"
            />
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={String(t("dashboard.rename.placeholder"))}
              className="text-text-primary min-w-0 flex-1 bg-transparent text-base leading-6 font-light outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pt-3 pb-5">
          <button
            type="submit"
            disabled={!value.trim() || busy}
            className={cn(
              "flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-base leading-6 font-medium text-black transition-colors",
              "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark,#026d5e)]",
              (!value.trim() || busy) && "cursor-not-allowed opacity-50"
            )}
          >
            <PenFilledIcon size={18} />
            {String(t("dashboard.rename.confirm"))}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};
