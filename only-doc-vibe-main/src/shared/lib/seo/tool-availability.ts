interface ToolWithUrl {
  readonly url: string;
}

export const getCanonicalSlugFromPath = (path: string): string =>
  path.replace(/^\//, "").split("/")[0] ?? "";

export const filterToolsByAvailableSlugs = <TTool extends ToolWithUrl>(
  tools: readonly TTool[],
  availableToolSlugs?: readonly string[]
): TTool[] => {
  if (!availableToolSlugs) return [...tools];

  const availableSlugs = new Set(availableToolSlugs);

  return tools.filter((tool) =>
    availableSlugs.has(getCanonicalSlugFromPath(tool.url))
  );
};
