import { useMemo, useState, type FC } from "react";
import { cn } from "@universe-forma/ui-pes";

import { useLocalizedHref } from "@/shared/lib/localized-links";
import { useTranslation } from "@/shared/lib/translations";

import {
  DASHBOARD_TOOL_CATEGORIES,
  EToolCategory,
  buildDashboardTools,
  type IDashboardTool,
} from "../../model/dashboard-tools";
import { StarIcon } from "../../lib/icons";

const CATEGORY_KEY: Record<EToolCategory, string> = {
  [EToolCategory.PDF]: "dashboard.tools.pdf",
  [EToolCategory.IMAGE]: "dashboard.tools.image",
  [EToolCategory.AI]: "dashboard.tools.ai",
};

type FilterValue = EToolCategory | "ALL";

interface DashboardToolsSectionProps {
  readonly availableToolSlugs?: readonly string[];
  readonly tools?: IDashboardTool[];
}

export const DashboardToolsSection: FC<DashboardToolsSectionProps> = ({
  availableToolSlugs,
  tools,
}) => {
  const { t } = useTranslation();
  const localizedHref = useLocalizedHref();
  const [filter, setFilter] = useState<FilterValue>("ALL");

  const fallbackTools = useMemo(() => buildDashboardTools(t), [t]);
  const resolvedTools = useMemo(() => {
    const sourceTools = tools && tools.length > 0 ? tools : fallbackTools;
    if (!availableToolSlugs) return sourceTools;

    const availableSlugs = new Set(availableToolSlugs);

    return sourceTools.filter((tool) => availableSlugs.has(tool.id));
  }, [availableToolSlugs, fallbackTools, tools]);

  const visibleCategories: EToolCategory[] =
    filter === "ALL" ? DASHBOARD_TOOL_CATEGORIES : [filter];

  return (
    <div className="flex flex-col gap-6">
      <div
        className="flex flex-wrap gap-1"
        role="tablist"
        aria-label={String(t("dashboard.tools.filterAria"))}
      >
        <FilterTab
          active={filter === "ALL"}
          onClick={() => setFilter("ALL")}
          label={String(t("dashboard.tools.all"))}
        />
        {DASHBOARD_TOOL_CATEGORIES.map((category) => (
          <FilterTab
            key={category}
            active={filter === category}
            onClick={() => setFilter(category)}
            label={String(t(CATEGORY_KEY[category] as never))}
            icon={
              category === EToolCategory.AI ? <StarIcon size={14} /> : undefined
            }
          />
        ))}
      </div>

      {visibleCategories.map((category) => {
        const tools = resolvedTools.filter(
          (tool) => tool.category === category
        );
        if (tools.length === 0) return null;

        return (
          <section key={category} className="flex flex-col gap-4">
            <h2 className="text-text-primary text-xl leading-6 font-semibold">
              {String(t(CATEGORY_KEY[category] as never))}
            </h2>
            <div
              className={cn(
                "grid gap-3",
                "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              )}
            >
              {tools.map((tool) => (
                <a
                  key={tool.id}
                  href={localizedHref(tool.url)}
                  className={cn(
                    "bg-bg-white-bg group flex items-start gap-3 rounded-2xl border border-[var(--color-os-divider)] p-4 transition-all",
                    "hover:border-[var(--color-primary-opacity-32)] hover:shadow-md"
                  )}
                >
                  <img
                    src={tool.icon}
                    alt=""
                    aria-hidden
                    className="h-[60px] w-[60px] shrink-0"
                    loading="lazy"
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-center pe-2 pt-1">
                    <span className="text-text-primary text-base leading-[22px] font-medium">
                      {tool.title}
                    </span>
                    {tool.description && (
                      <span className="text-text-secondary text-sm leading-[18px]">
                        {tool.description}
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

interface FilterTabProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}

const FilterTab: FC<FilterTabProps> = ({ active, onClick, label, icon }) => (
  <button
    type="button"
    role="tab"
    aria-selected={active}
    onClick={onClick}
    className={cn(
      "flex h-10 cursor-pointer items-center gap-1.5 rounded-xl px-2.5 text-sm font-medium transition-colors",
      active
        ? "bg-[rgba(0,0,0,0.87)] text-white"
        : "border border-[rgba(0,0,0,0.15)] text-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.04)]"
    )}
  >
    {icon && <span className="flex shrink-0 items-center">{icon}</span>}
    {label}
  </button>
);
