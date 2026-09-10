import { useState, type FC } from "react";
import { cn } from "@universe-forma/ui-pes";
import GridBannerAvatar from "@public/assets/illustrations/dashboard/upgrade-banner-avatar.png?url";
import RocketBannerIcon from "@public/assets/icons/dashboard/rocket-banner.svg?url";

import { CloseIcon } from "@/shared/ui/dashboard-icons";
import { useTranslation } from "@/shared/lib/translations";

interface Props {
  variant?: "list" | "grid";
}

export const DashboardUpgradeBanner: FC<Props> = ({ variant = "list" }) => {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
  };

  const isGrid = variant === "grid";

  return (
    <div
      role="banner"
      className={cn(
        "relative flex items-center gap-3 rounded-xl p-4",
        isGrid
          ? "bg-[var(--color-primary-filled-50)]"
          : "bg-[var(--color-primary-filled-50)]"
      )}
    >
      {/* Icon square */}
      {isGrid ? (
        <img
          src={GridBannerAvatar}
          alt=""
          aria-hidden
          className="h-12 w-12 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <img
          src={RocketBannerIcon}
          alt=""
          aria-hidden
          className="h-12 w-12 shrink-0 rounded-lg"
        />
      )}

      {/* Text */}
      <div
        className={cn(
          "min-w-0 flex-1",
          !isGrid && "flex flex-col justify-center gap-0.5"
        )}
      >
        <p className="text-text-primary text-lg leading-[26px] font-medium">
          {String(t("dashboard.upgrade.title"))}
        </p>
        <p
          className={cn(
            "text-base leading-[22px]",
            isGrid ? "text-[rgba(0,0,0,0.88)]" : "text-text-primary opacity-88"
          )}
        >
          {String(t("dashboard.upgrade.subtitle"))}
        </p>
      </div>

      {/* Dismiss */}
      {isGrid ? (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={String(t("dashboard.upgrade.dismiss"))}
          className="text-text-secondary flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center self-start rounded-lg transition-colors hover:bg-[rgba(0,0,0,0.06)]"
        >
          <CloseIcon size={16} />
        </button>
      ) : (
        <div className="relative w-8 shrink-0 self-stretch">
          <button
            type="button"
            onClick={handleDismiss}
            aria-label={String(t("dashboard.upgrade.dismiss"))}
            className="absolute -end-1.5 -top-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[rgba(0,0,0,0.48)] transition-colors hover:bg-[rgba(0,0,0,0.06)]"
          >
            <CloseIcon size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
