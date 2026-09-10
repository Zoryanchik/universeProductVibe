import type { CmsModalContentMap } from "../cms-modal-content";
import type { LocaleSlugMap } from "../seo/get-localized-tool-href";

interface ToolWithDescription {
  readonly id: string;
  readonly description: string;
}

export interface DashboardPageBuildData<TTool extends ToolWithDescription> {
  readonly cmsModalData: Partial<CmsModalContentMap>;
  readonly tools: TTool[];
  readonly slugMap: LocaleSlugMap;
  readonly availableToolSlugs: readonly string[];
}

export const mergeToolDescriptions = <TTool extends ToolWithDescription>(
  tools: readonly TTool[],
  descriptionMap: Readonly<Record<string, string>>
): TTool[] =>
  tools.map((tool) => ({
    ...tool,
    description: descriptionMap[tool.id] ?? tool.description,
  }));

export const buildDashboardPageData = <TTool extends ToolWithDescription>({
  cmsModalData,
  tools,
  slugMap,
}: {
  cmsModalData: Partial<CmsModalContentMap>;
  tools: readonly TTool[];
  slugMap: LocaleSlugMap;
}): DashboardPageBuildData<TTool> => ({
  cmsModalData,
  tools: [...tools],
  slugMap,
  availableToolSlugs: tools.map((tool) => tool.id),
});
