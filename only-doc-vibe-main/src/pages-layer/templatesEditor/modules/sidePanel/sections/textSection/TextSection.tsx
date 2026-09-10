import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";
import { useMemo, useState, type FC } from "react";

import { useTranslation } from "@/shared/lib/translations";

import { HorizontalTabs } from "../../../../ui/HorizontalTabs";
import { SidePanelSectionLabel } from "../../../../ui/SidePanelSectionLabel";
import { useTemplatesEditorStore } from "../../../../model/store/templates-editor-store";
import { BasicTextTab } from "./tabs/basic/Basic";
import { UploadFontTab } from "./tabs/UploadFont";
import { TextEffectsPanel } from "./sections/TextEffects";

const TEXT_TABS = [
  {
    id: "basic",
    icon: "text_fields",
    labelKey: "templatesEditor.side_panel.text_tabs.basic",
  },
  {
    id: "upload_font",
    icon: "font_download",
    labelKey: "templatesEditor.side_panel.text_tabs.upload_font",
  },
];

interface TextSectionPanelProps {
  store: StoreType;
}

export const TextSectionPanel: FC<TextSectionPanelProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const [activeTabId, setActiveTabId] = useState<string>(TEXT_TABS[0].id);
    const isEffectsMode = useTemplatesEditorStore.use.effectsMode();

    const tabs = useMemo(
      () =>
        TEXT_TABS.map((tab) => ({
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

    if (isEffectsMode) {
      return <TextEffectsPanel store={store} />;
    }

    return (
      <div className="box-border flex min-h-0 w-full flex-1 flex-col gap-6 overflow-hidden pt-5">
        <div className="box-border flex w-full flex-shrink-0 flex-col gap-3 px-5">
          <SidePanelSectionLabel
            label={t("templatesEditor.side_panel.headers.add_text") as string}
            type="header"
          />
          <HorizontalTabs
            activeTab={activeLabel}
            tabs={tabs}
            onClick={handleTabClick}
          />
        </div>
        {activeTabId === "basic" && <BasicTextTab store={store} />}
        {activeTabId === "upload_font" && <UploadFontTab store={store} />}
      </div>
    );
  }
);
