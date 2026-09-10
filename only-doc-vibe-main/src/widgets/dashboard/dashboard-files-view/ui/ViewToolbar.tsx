import type { FC } from "react";
import { cn } from "@universe-forma/ui-pes";

import { useTranslation } from "@/shared/lib/translations";
import { GridViewIcon, ListViewIcon } from "@/shared/ui/dashboard-icons";

import {
  EDashboardViewMode,
  setDashboardViewMode,
  useDashboardStore,
} from "@/entities/documents";

export const ViewToolbar: FC = () => {
  const { t } = useTranslation();
  const viewMode = useDashboardStore.use.viewMode();

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-xl p-1">
        <button
          type="button"
          aria-label={String(t("dashboard.view.list"))}
          aria-pressed={viewMode === EDashboardViewMode.LIST}
          onClick={() => setDashboardViewMode(EDashboardViewMode.LIST)}
          className={cn(
            "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
            viewMode === EDashboardViewMode.LIST
              ? "text-text-primary bg-[rgba(0,0,0,0.08)]"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          <ListViewIcon
            size={20}
            filled={viewMode === EDashboardViewMode.LIST}
          />
          <span className="hidden sm:inline">
            {String(t("dashboard.view.list"))}
          </span>
        </button>
        <button
          type="button"
          aria-label={String(t("dashboard.view.grid"))}
          aria-pressed={viewMode === EDashboardViewMode.GRID}
          onClick={() => setDashboardViewMode(EDashboardViewMode.GRID)}
          className={cn(
            "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
            viewMode === EDashboardViewMode.GRID
              ? "text-text-primary bg-[rgba(0,0,0,0.08)]"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          <GridViewIcon
            size={20}
            filled={viewMode === EDashboardViewMode.GRID}
          />
          <span className="hidden sm:inline">
            {String(t("dashboard.view.grid"))}
          </span>
        </button>
      </div>
    </div>
  );
};
