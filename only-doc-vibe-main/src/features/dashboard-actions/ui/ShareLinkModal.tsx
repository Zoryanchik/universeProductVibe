import { useEffect, useState, type FC } from "react";
import { cn } from "@universe-forma/ui-pes";

import { CopyFilledIcon } from "@/shared/ui/dashboard-icons";
import { BaseModal } from "@/shared/ui/base-modal/BaseModal";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import {
  closeModal,
  useCurrentModalOptions,
} from "@/shared/lib/modals/modals-store";
import { showToast } from "@/shared/lib/toast/toast-store";
import { useTranslation } from "@/shared/lib/translations";
import type { IDashboardShareLinkModalOptions } from "@/shared/lib/modals/dashboard-modal-options";

import { useDashboardActions } from "../model/use-dashboard-actions";

export type { IDashboardShareLinkModalOptions } from "@/shared/lib/modals/dashboard-modal-options";

export const DashboardShareLinkModal: FC = () => {
  const { t } = useTranslation();
  const options = useCurrentModalOptions(
    EModalsTypes.DASHBOARD_SHARE_LINK
  ) as IDashboardShareLinkModalOptions | null;
  const { fetchShareLink } = useDashboardActions();
  const [link, setLink] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!options) return;

    let cancelled = false;
    setLoading(true);
    fetchShareLink(options.fileId).then((url) => {
      if (cancelled) return;

      setLink(url ?? "");
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [options, fetchShareLink]);

  if (!options) return null;

  const handleCopy = async () => {
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      showToast(String(t("dashboard.toast.linkCopied")), {
        type: "success",
        icon: "link",
        position: "bottom",
      });
      closeModal(EModalsTypes.DASHBOARD_SHARE_LINK);
    } catch {
      // ignore
    }
  };

  return (
    <BaseModal
      modalType={EModalsTypes.DASHBOARD_SHARE_LINK}
      headerTitle={String(t("dashboard.share.title"))}
      headerSubtitle={options.filename}
      headerAlign="left"
      className="w-full max-w-[592px]"
    >
      {/* Link input */}
      <div className="px-6 pb-6">
        <label className="mb-1 block text-[13px] leading-[14px] font-light text-[rgba(0,0,0,0.6)]">
          {String(t("dashboard.share.linkLabel"))}
        </label>
        <div className="flex min-h-[56px] items-center gap-2 rounded-xl border border-[rgba(0,0,0,0.14)] px-3 py-4">
          <CopyFilledIcon
            size={18}
            className="shrink-0 text-[var(--color-primary)]"
          />
          <span className="text-text-primary min-w-0 flex-1 truncate text-base leading-6 font-light">
            {loading ? String(t("dashboard.share.loading")) : link}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pt-3 pb-5">
        <button
          type="button"
          onClick={handleCopy}
          disabled={loading || !link}
          className={cn(
            "flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-base leading-6 font-medium text-black transition-colors",
            "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark,#026d5e)]",
            (loading || !link) && "cursor-not-allowed opacity-50"
          )}
        >
          <CopyFilledIcon size={20} />
          {String(
            copied ? t("dashboard.share.copied") : t("dashboard.share.copyLink")
          )}
        </button>
      </div>
    </BaseModal>
  );
};
