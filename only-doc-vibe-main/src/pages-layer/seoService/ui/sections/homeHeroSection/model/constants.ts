import { EServiceTabId } from "@/shared/constants/service-tabs";

import type { IServiceTab } from "../ui/HeroServiceTabs";

export const DEFAULT_SERVICE_TAB_ID = EServiceTabId.EDIT_PDF;

export const SERVICE_TABS: readonly IServiceTab[] = [
  { id: EServiceTabId.EDIT_PDF, label: "Edit PDF" },
  { id: EServiceTabId.CONVERT_FROM_PDF, label: "Convert from PDF" },
  { id: EServiceTabId.CONVERT_TO_PDF, label: "Convert to PDF" },
  { id: EServiceTabId.IMAGE_TOOLS, label: "Image tools" },
  { id: EServiceTabId.AI_TOOLS, label: "AI tools" },
] as const;
