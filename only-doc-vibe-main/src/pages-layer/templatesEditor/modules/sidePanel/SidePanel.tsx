import { observer } from "mobx-react-lite";
import { useMemo, type FC } from "react";
import type { StoreType } from "polotno/model/store";

import { cn } from "@/shared/lib/utils/cn";
import { useTranslation } from "@/shared/lib/translations";

import ToolTab from "../../ui/ToolTab";
import { SidePanelToggle } from "../../components/SidePanelToggle";
import { CustomScrollArea } from "../../ui/CustomScrollArea";
import { useTemplatesEditorStore } from "../../model/store/templates-editor-store";
import { scrollableTabs, fixedTabs, allTabs } from "./tabsConfig";

interface EditorSidePanelProps {
  store: StoreType;
}

export const EditorSidePanel: FC<EditorSidePanelProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const activeTab = useTemplatesEditorStore.use.sidePanelActiveTab();
    const isEffectsMode = useTemplatesEditorStore.use.effectsMode();
    const isMaskMode = useTemplatesEditorStore.use.maskImageMode();
    const setSidePanelActiveTab =
      useTemplatesEditorStore.use.setSidePanelActiveTab();
    const setEffectsMode = useTemplatesEditorStore.use.setEffectsMode();
    const setMaskImageMode = useTemplatesEditorStore.use.setMaskImageMode();

    const clearModes = () => {
      if (isEffectsMode) setEffectsMode(false);

      if (isMaskMode) setMaskImageMode(false);
    };

    const handleTabClick = (tabName: string) => {
      clearModes();
      setSidePanelActiveTab(activeTab === tabName ? null : tabName);
    };

    const handleToggle = () => {
      if (activeTab) {
        clearModes();
        setSidePanelActiveTab(null);
      }
    };

    const ActivePanel = allTabs.find((tab) => tab.name === activeTab)?.Panel;
    const isExpanded = !!activeTab;

    const localizedScrollableTabs = useMemo(
      () =>
        scrollableTabs.map((tab) => ({
          ...tab,
          label: t(tab.labelKey) as string,
        })),
      [t]
    );
    const localizedFixedTabs = useMemo(
      () =>
        fixedTabs.map((tab) => ({
          ...tab,
          label: t(tab.labelKey) as string,
        })),
      [t]
    );

    return (
      <div className="relative z-[1] me-4 flex h-full rounded-[24px] bg-[var(--color-material-grey-100)] shadow-[0px_4px_10px_0px_rgba(91,91,91,0.16)]">
        <div
          className={cn(
            "relative box-border flex h-full w-[104px] min-w-[104px] flex-col items-center bg-[var(--color-bg-white-bg)]",
            isExpanded ? "rounded-s-[24px]" : "rounded-[24px]"
          )}
        >
          <CustomScrollArea className="w-full flex-1">
            <div className="flex flex-col gap-0.5 p-2">
              {localizedScrollableTabs.map((tab) => (
                <ToolTab
                  key={tab.name}
                  activeTab={activeTab}
                  tab={tab}
                  onClick={handleTabClick}
                />
              ))}
            </div>
          </CustomScrollArea>

          <div className="h-px w-[calc(100%-4px)] bg-[rgba(0,0,0,0.14)]" />

          <div className="relative -mx-2 flex w-full flex-col gap-0.5 rounded-[24px] bg-[var(--color-bg-white-bg)] p-2 backdrop-blur-[20px]">
            {localizedFixedTabs.map((tab) => (
              <ToolTab
                key={tab.name}
                activeTab={activeTab}
                tab={tab}
                onClick={handleTabClick}
              />
            ))}
          </div>
        </div>

        {isExpanded && ActivePanel && (
          <>
            <div className="flex h-full w-[459px] min-w-[250px] flex-1 flex-col overflow-hidden rounded-e-[24px] border-s border-s-[rgba(0,0,0,0.08)] bg-[var(--color-bg-white-bg)]">
              <ActivePanel store={store} />
            </div>
            <SidePanelToggle isExpanded={isExpanded} onToggle={handleToggle} />
          </>
        )}
      </div>
    );
  }
);
