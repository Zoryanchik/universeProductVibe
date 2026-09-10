import type { ComponentType } from "react";
import type { StoreType } from "polotno/model/store";

import { DrawSectionPanel } from "./sections/DrawSection";
import { TextSectionPanel } from "./sections/textSection/TextSection";
import { PhotoSectionPanel } from "./sections/photoSection/PhotoSection";
import { UploadSectionPanel } from "./sections/UploadSection";
import { SignatureSection } from "./sections/SignatureSection";
import { ElementsSectionPanel } from "./sections/elementsSection/ElementsSection";
import { BackgroundSectionPanel } from "./sections/BackgroundSection";
import { LayersSectionPanel } from "./sections/LayersSection";
import { SizeSectionPanel } from "./sections/sizeSection/SizeSection";
import { TemplatesSectionPanel } from "./sections/TemplatesSection";

export interface ToolTabConfig {
  name: string;
  icon: string;
  labelKey: string;
  isCustomIcon?: boolean;
  Panel: ComponentType<{ store: StoreType }>;
}

export const scrollableTabs: ToolTabConfig[] = [
  {
    name: "text",
    icon: "text_fields",
    labelKey: "templatesEditor.side_panel.tabs.text",
    Panel: TextSectionPanel,
  },
  {
    name: "photos",
    icon: "image",
    labelKey: "templatesEditor.side_panel.tabs.photo",
    Panel: PhotoSectionPanel,
  },
  {
    name: "elements",
    icon: "shapes",
    labelKey: "templatesEditor.side_panel.tabs.elements",
    Panel: ElementsSectionPanel,
  },
  {
    name: "draw",
    icon: "stylus",
    labelKey: "templatesEditor.side_panel.tabs.draw",
    Panel: DrawSectionPanel,
  },
  {
    name: "signature",
    icon: "signature",
    labelKey: "templatesEditor.side_panel.tabs.signature",
    Panel: SignatureSection,
  },
  {
    name: "templates",
    icon: "view_quilt",
    labelKey: "templatesEditor.side_panel.tabs.template",
    Panel: TemplatesSectionPanel,
  },
  {
    name: "upload",
    icon: "cloud_upload",
    labelKey: "templatesEditor.side_panel.tabs.upload",
    Panel: UploadSectionPanel,
  },
  {
    name: "background",
    icon: "background_dot_small",
    labelKey: "templatesEditor.side_panel.tabs.background",
    Panel: BackgroundSectionPanel,
  },
];

export const fixedTabs: ToolTabConfig[] = [
  {
    name: "resize",
    icon: "resize",
    labelKey: "templatesEditor.side_panel.tabs.resize",
    Panel: SizeSectionPanel,
  },
  {
    name: "layers",
    icon: "layers",
    labelKey: "templatesEditor.side_panel.tabs.layers",
    Panel: LayersSectionPanel,
  },
];

export const allTabs: ToolTabConfig[] = [...scrollableTabs, ...fixedTabs];
