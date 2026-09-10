import { EFunnels } from "./funnels";

export const EDITOR_FUNNELS: readonly EFunnels[] = [
  EFunnels.MERGE_PDF,
  EFunnels.SPLIT_PDF,
  EFunnels.SIGN_PDF,
  EFunnels.EDIT_PDF,
  EFunnels.DELETE_PDF_PAGES,
  EFunnels.ROTATE_PDF,
  EFunnels.PDF_READER,
] as const;

export type EditorFunnelAction = "split" | "signature" | "hand" | "merge";

const EDITOR_FUNNEL_ACTIONS: Partial<Record<EFunnels, EditorFunnelAction>> = {
  [EFunnels.MERGE_PDF]: "merge",
  [EFunnels.SPLIT_PDF]: "split",
  [EFunnels.SIGN_PDF]: "signature",
  [EFunnels.PDF_READER]: "hand",
};

export const isEditorFunnel = (funnel: EFunnels): boolean =>
  EDITOR_FUNNELS.includes(funnel);

export const getEditorFunnelAction = (
  funnel: EFunnels
): EditorFunnelAction | null => EDITOR_FUNNEL_ACTIONS[funnel] ?? null;
