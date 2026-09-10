import { useMemo, useState, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { HorizontalTabs } from "../../../../ui/HorizontalTabs";
import { SidePanelSectionLabel } from "../../../../ui/SidePanelSectionLabel";
import { CustomScrollArea } from "../../../../ui/CustomScrollArea";
import { CustomSection } from "./sections/Custom";
import { PresetsSection } from "./sections/Presets";

const SIZE_TABS = [
  {
    id: "custom",
    icon: "instant_mix",
    labelKey: "templatesEditor.side_panel.size_tabs.custom",
  },
  {
    id: "presets",
    icon: "dashboard_2_edit",
    labelKey: "templatesEditor.side_panel.size_tabs.presets",
  },
];

interface SizeSectionPanelProps {
  store: StoreType;
}

export const SizeSectionPanel: FC<SizeSectionPanelProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const [activeTabId, setActiveTabId] = useState("presets");

    const tabs = useMemo(
      () =>
        SIZE_TABS.map((tab) => ({
          id: tab.id,
          icon: tab.icon,
          label: t(tab.labelKey) as string,
        })),
      [t]
    );

    const activeLabel = tabs.find((tab) => tab.id === activeTabId)?.label;

    const handleTabClick = (label: string) => {
      const id = tabs.find((tab) => tab.label === label)?.id;
      if (id) setActiveTabId(id);
    };

    return (
      <div className="box-border flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        <div className="flex flex-shrink-0 flex-col gap-3 px-5 pt-5 pb-4">
          <SidePanelSectionLabel
            label={
              t("templatesEditor.side_panel.headers.adjust_canvas") as string
            }
            type="header"
          />
          <HorizontalTabs
            activeTab={activeLabel}
            tabs={tabs}
            onClick={handleTabClick}
          />
        </div>

        <CustomScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-6 px-5 pb-6">
            {activeTabId === "custom" && <CustomSection store={store} />}
            {activeTabId === "presets" && <PresetsSection store={store} />}
          </div>
        </CustomScrollArea>
      </div>
    );
  }
);
