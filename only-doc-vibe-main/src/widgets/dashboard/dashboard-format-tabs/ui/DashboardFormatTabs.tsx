import type { FC } from "react";
import { cn } from "@universe-forma/ui-pes";

import { useTranslation } from "@/shared/lib/translations";

import {
  EFormatGroup,
  FORMAT_GROUPS,
  setDashboardFormatGroup,
  useDashboardStore,
  useFormatGroupCounts,
} from "@/entities/documents";

const FORMAT_GROUP_I18N_KEY: Record<EFormatGroup, string> = {
  [EFormatGroup.ALL]: "dashboard.formatTabs.all",
  [EFormatGroup.PDF]: "dashboard.formatTabs.pdf",
  [EFormatGroup.IMAGE]: "dashboard.formatTabs.image",
  [EFormatGroup.WORD]: "dashboard.formatTabs.word",
  [EFormatGroup.SPREADSHEET]: "dashboard.formatTabs.spreadsheet",
  [EFormatGroup.PRESENTATION]: "dashboard.formatTabs.presentation",
  [EFormatGroup.EBOOK]: "dashboard.formatTabs.ebook",
  [EFormatGroup.AUDIO]: "dashboard.formatTabs.audio",
  [EFormatGroup.VIDEO]: "dashboard.formatTabs.video",
  [EFormatGroup.TEXT]: "dashboard.formatTabs.text",
  [EFormatGroup.OTHER]: "dashboard.formatTabs.other",
};

export const DashboardFormatTabs: FC = () => {
  const { t } = useTranslation();
  const active = useDashboardStore.use.formatGroup();
  const counts = useFormatGroupCounts();
  const files = useDashboardStore.use.files();
  const isLoading = useDashboardStore.use.isLoading();

  if (!isLoading && files.length === 0) return null;

  return (
    <div
      className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label={String(t("dashboard.formatTabs.all"))}
    >
      {FORMAT_GROUPS.map((group) => {
        const isActive = group === active;
        const count = counts[group];
        const label = String(t(FORMAT_GROUP_I18N_KEY[group]));
        if (group !== EFormatGroup.ALL && count === 0 && !isActive) return null;

        return (
          <button
            key={group}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setDashboardFormatGroup(group)}
            className={cn(
              "flex shrink-0 cursor-pointer items-center gap-1 rounded-[10px] px-2 py-[7px] text-sm font-medium transition-colors",
              isActive
                ? "text-text-primary bg-[rgba(0,0,0,0.08)]"
                : "text-text-primary hover:bg-[rgba(0,0,0,0.04)]"
            )}
          >
            <span className="uppercase">{label}</span>
            <span className="text-text-primary flex items-center justify-center rounded-[5px] border border-[rgba(0,0,0,0.15)] bg-white px-2 py-0.5 text-[10px] font-medium uppercase">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
