import { useMemo, useState, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { SidePanelSectionLabel } from "../../../ui/SidePanelSectionLabel";
import { HorizontalTabs } from "../../../ui/HorizontalTabs";
import { UploadFontTab } from "./textSection/tabs/UploadFont";
import { UploadPhotoTab } from "./photoSection/tabs/UploadPhoto";

const UPLOAD_TABS = [
  {
    id: "photo",
    icon: "photo",
    labelKey: "templatesEditor.side_panel.upload_tabs.photo",
  },
  {
    id: "font",
    icon: "font_download",
    labelKey: "templatesEditor.side_panel.upload_tabs.font",
  },
];

interface UploadSectionPanelProps {
  store: StoreType;
}

export const UploadSectionPanel: FC<UploadSectionPanelProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const [activeTabId, setActiveTabId] = useState<string>(UPLOAD_TABS[0].id);

    const tabs = useMemo(
      () =>
        UPLOAD_TABS.map((tab) => ({
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
      <div className="box-border flex min-h-0 w-full flex-1 flex-col gap-6 overflow-hidden pt-5">
        <div className="box-border flex w-full flex-shrink-0 flex-col gap-3 px-5">
          <SidePanelSectionLabel
            label={
              t("templatesEditor.side_panel.headers.upload_file") as string
            }
            type="header"
          />
          <HorizontalTabs
            activeTab={activeLabel}
            tabs={tabs}
            onClick={handleTabClick}
          />
        </div>
        {activeTabId === "photo" && (
          <UploadPhotoTab store={store} from="upload" />
        )}
        {activeTabId === "font" && (
          <UploadFontTab store={store} from="upload" />
        )}
      </div>
    );
  }
);
