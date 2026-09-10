import type { FC } from "react";
import { cn } from "@universe-forma/ui-pes";

import { TOOL_CARDS, type IToolCard } from "@/shared/constants/service-tabs";
import { useLocalizedHref } from "@/shared/lib/localized-links";
import { filterToolsByAvailableSlugs } from "@/shared/lib/seo/tool-availability";

const QUICK_ACCESS_TOOL_IDS: string[] = [
  "pdf-to-word",
  "compress-pdf",
  "merge-pdf",
  "edit-pdf",
  "translate-pdf",
  "pdf-ocr",
];

interface DashboardQuickToolsProps {
  readonly availableToolSlugs?: readonly string[];
  readonly tools?: readonly Pick<IToolCard, "id" | "title" | "icon" | "url">[];
}

type DashboardQuickTool = Pick<IToolCard, "id" | "title" | "icon" | "url">;

export const DashboardQuickTools: FC<DashboardQuickToolsProps> = ({
  availableToolSlugs,
  tools: cmsTools,
}) => {
  const localizedHref = useLocalizedHref();
  const quickTools = QUICK_ACCESS_TOOL_IDS.map((id) => {
    const cmsTool = cmsTools?.find((t) => t.id === id);
    if (cmsTool) return cmsTool;

    return TOOL_CARDS.find((tool) => tool.id === id);
  }).filter((tool): tool is DashboardQuickTool => Boolean(tool));
  const tools = filterToolsByAvailableSlugs(quickTools, availableToolSlugs);

  if (tools.length === 0) return null;

  return (
    <div className="flex min-w-0 items-stretch gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tools.map((tool) => (
        <a
          key={tool.id}
          href={localizedHref(tool.url)}
          className={cn(
            "bg-bg-light-grey flex h-14 min-w-[220px] flex-1 cursor-pointer items-center gap-2",
            "rounded-xl px-3 py-3 transition-colors",
            "hover:bg-[var(--color-action-8)]"
          )}
        >
          <img
            src={tool.icon}
            alt=""
            aria-hidden
            className="h-9 w-9 shrink-0"
            loading="lazy"
          />
          <span className="text-text-primary shrink-0 text-sm leading-[18px] font-semibold whitespace-nowrap">
            {tool.title}
          </span>
        </a>
      ))}
    </div>
  );
};
