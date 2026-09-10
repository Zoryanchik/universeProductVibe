export type EditorExportDpi = 72 | 150 | 300;

/** Mirrors SDK ExportImage.vue defaults (quality, dpi, ignoreClip). */
export interface EditorExportSettings {
  readonly scope: "all" | "current";
  readonly quality: number;
  readonly dpi: EditorExportDpi;
  /** SDK `ignoreClip` — hides bleed/clip guides and trims blank workspace edges. */
  readonly ignoreBlankEdges: boolean;
}

export const DEFAULT_EDITOR_EXPORT_SETTINGS: EditorExportSettings = {
  scope: "all",
  quality: 1,
  dpi: 300,
  ignoreBlankEdges: true,
};
