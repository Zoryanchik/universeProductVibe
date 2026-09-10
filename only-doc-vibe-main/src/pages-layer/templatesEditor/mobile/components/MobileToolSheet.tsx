import { type FC, useEffect, useMemo, useRef } from "react";
import { observer } from "mobx-react-lite";
import { reaction } from "mobx";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { allTabs } from "../../modules/sidePanel/tabsConfig";
import { useTemplatesEditorStore } from "../../model/store/templates-editor-store";
import {
  MOBILE_TAB_BAR_HEIGHT,
  MOBILE_TOOL_SHEET_MAX_HEIGHT,
  MOBILE_SHEET_MAX_HEIGHT_DVH,
} from "../../constants/sizes";
import { BottomSheet } from "./BottomSheet";

// Neutralizes a panel's own flex/scroll so its content flows at natural height and
// the bottom sheet's outer scroll container handles scrolling — otherwise the
// panel's inner CustomScrollArea collapses to a sliver inside the sheet.
const PANEL_SCROLL_RESET =
  "w-full [&>*]:!flex-none [&>*]:![min-height:auto] [&>*]:!overflow-visible [&_.custom-scroll-area]:!flex-none [&_.custom-scroll-area]:!overflow-visible [&_.custom-scroll-area-viewport]:!flex-none [&_.custom-scroll-area-viewport]:![min-height:auto] [&_.custom-scroll-area-viewport]:!overflow-visible [&_.custom-scroll-area-track]:!hidden";

interface MobileToolSheetProps {
  store: StoreType;
}

/**
 * Hosts the active side-panel section inside a bottom sheet. It opens for a tapped
 * tab as well as for the effects/mask modes (which drive their own panel), and
 * auto-closes once the user inserts/selects an element so the contextual bar can
 * take over.
 */
export const MobileToolSheet: FC<MobileToolSheetProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const activeTab = useTemplatesEditorStore.use.sidePanelActiveTab();
    const isSheetOpen = useTemplatesEditorStore.use.mobileToolSheetOpen();
    const effectsMode = useTemplatesEditorStore.use.effectsMode();
    const maskImageMode = useTemplatesEditorStore.use.maskImageMode();
    const setMobileToolSheetOpen =
      useTemplatesEditorStore.use.setMobileToolSheetOpen();
    const setEffectsMode = useTemplatesEditorStore.use.setEffectsMode();
    const setMaskImageMode = useTemplatesEditorStore.use.setMaskImageMode();

    const isModeSheet = effectsMode || maskImageMode;
    const open = isSheetOpen || isModeSheet;

    const activeTabConfig = useMemo(
      () => allTabs.find((tab) => tab.name === activeTab),
      [activeTab]
    );

    const prevSelectionCount = useRef(store.selectedElements.length);

    // Close the tool sheet as soon as the selection grows (an element was inserted
    // from the panel or the user tapped the canvas). Skipped for effects/mask/draw
    // which intentionally keep the panel open alongside a selection.
    useEffect(() => {
      return reaction(
        () => store.selectedElements.length,
        (count) => {
          const grew = count > prevSelectionCount.current;
          prevSelectionCount.current = count;

          if (!grew) return;

          if (isModeSheet || activeTab === "draw") return;

          if (useTemplatesEditorStore.getState().mobileToolSheetOpen) {
            setMobileToolSheetOpen(false);
          }
        }
      );
    }, [store, isModeSheet, activeTab, setMobileToolSheetOpen]);

    const handleOpenChange = (next: boolean) => {
      if (next) return;

      setMobileToolSheetOpen(false);
      if (effectsMode) setEffectsMode(false);

      if (maskImageMode) setMaskImageMode(false);
    };

    const ActivePanel = activeTabConfig?.Panel;
    const title = activeTabConfig
      ? (t(activeTabConfig.labelKey) as string)
      : "";

    // Effects/mask modes replace the tab bar, so the sheet can sit flush at the
    // bottom; a tapped tab keeps the tab bar visible beneath it.
    const bottomOffset = isModeSheet ? 0 : MOBILE_TAB_BAR_HEIGHT;

    return (
      <BottomSheet
        open={open && !!ActivePanel}
        onOpenChange={handleOpenChange}
        title={title}
        bottomOffset={bottomOffset}
        maxHeight={`min(${MOBILE_TOOL_SHEET_MAX_HEIGHT}px, ${MOBILE_SHEET_MAX_HEIGHT_DVH}dvh)`}
      >
        <div className={PANEL_SCROLL_RESET}>
          {ActivePanel && <ActivePanel store={store} />}
        </div>
      </BottomSheet>
    );
  }
);
