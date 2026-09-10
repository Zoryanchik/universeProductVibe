import { type FC, useState } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";
import { PolotnoContainer, WorkspaceWrap } from "polotno";
import { Workspace } from "polotno/canvas/workspace";

import { useTranslation } from "@/shared/lib/translations";

import { useTableTouchBridge } from "../helpers/useTableTouchBridge";
import { useMobileDrawMode } from "../helpers/useMobileDrawMode";
import { useTemplatesEditorStore } from "../model/store/templates-editor-store";
import { SELECTION_BORDER_COLOR } from "../constants/colors";
import { MOBILE_TAB_BAR_HEIGHT } from "../constants/sizes";
import { PageToolbar } from "../components/PageToolbar";
import { ContextualTooltip } from "../components/ContextualTooltip";
import { MobileHeader } from "./components/MobileHeader";
import { MobileTabBar } from "./components/MobileTabBar";
import { MobileToolSheet } from "./components/MobileToolSheet";
import { MobileContextualBar } from "./components/MobileContextualBar";
import { MobileDrawBar } from "./components/MobileDrawBar";
import { MobileNavbar } from "./components/MobileNavbar";
import { MobilePagesStrip } from "./components/MobilePagesStrip";
import { MobileOverflowMenu } from "./components/MobileOverflowMenu";
import { BottomSheet } from "./components/BottomSheet";
import { useEditorActions } from "../helpers/useEditorActions";

interface MobileEditorLayoutProps {
  store: StoreType;
}

export const MobileEditorLayout: FC<MobileEditorLayoutProps> = observer(
  ({ store }) => {
    const { t } = useTranslation();
    const {
      templateName,
      isExporting,
      handleFileNameChange,
      handlePrint,
      runExport,
    } = useEditorActions({ store });

    const isDrawMode = useTemplatesEditorStore.use.mobileDrawMode();
    const isSheetOpen = useTemplatesEditorStore.use.mobileToolSheetOpen();
    const effectsMode = useTemplatesEditorStore.use.effectsMode();
    const maskImageMode = useTemplatesEditorStore.use.maskImageMode();
    const setMobileToolSheetOpen =
      useTemplatesEditorStore.use.setMobileToolSheetOpen();
    const setEffectsMode = useTemplatesEditorStore.use.setEffectsMode();
    const setMaskImageMode = useTemplatesEditorStore.use.setMaskImageMode();

    useTableTouchBridge(store);
    useMobileDrawMode(store, isDrawMode, isSheetOpen);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPagesOpen, setIsPagesOpen] = useState(false);

    const isModeSheet = effectsMode || maskImageMode;
    const isToolSheetOpen = isSheetOpen || isModeSheet;
    const selectedCount = store.selectedElements.length;
    const hasSelection = selectedCount > 0;

    const handleShare = () => {
      setIsMenuOpen(false);
      runExport("pdf", { share: true });
    };

    // Tapping the dimmed canvas closes whatever sheet/mode is open (in addition to
    // swipe-down), like Canva. The header and bottom bars stay tappable.
    const handleDismissSheet = () => {
      if (effectsMode) setEffectsMode(false);

      if (maskImageMode) setMaskImageMode(false);

      setMobileToolSheetOpen(false);
    };

    const renderBottomBar = () => {
      // Draw matches the other tabs: while its config panel is open the tab bar
      // stays visible beneath it; once closed the compact draw toolbar takes over
      // so the user can keep drawing.
      if (isDrawMode) {
        return isSheetOpen ? <MobileTabBar /> : <MobileDrawBar store={store} />;
      }

      if (hasSelection) {
        return !isToolSheetOpen && <MobileContextualBar store={store} />;
      }

      return <MobileTabBar />;
    };

    return (
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[var(--color-material-grey-100)]">
        <MobileHeader
          store={store}
          isExporting={isExporting}
          onOpenMenu={() => setIsMenuOpen(true)}
          runExport={runExport}
        />

        <div className="relative min-h-0 flex-1 [&_.polotno-workspace-inner]:bg-[var(--color-material-grey-100)]">
          <PolotnoContainer style={{ height: "100%" }}>
            <WorkspaceWrap style={{ minWidth: 0 }}>
              <Workspace
                store={store}
                renderOnlyActivePage
                backgroundColor="transparent"
                pageBorderColor="rgba(30, 24, 24, 0.07)"
                activePageBorderColor="rgba(30, 24, 24, 0.07)"
                selectionRectFill="rgba(11, 153, 255, 0.1)"
                selectionRectStroke={SELECTION_BORDER_COLOR}
                selectionRectStrokeWidth={1}
                snapGuideStroke={SELECTION_BORDER_COLOR}
                snapGuideStrokeWidth={1}
                transformLabelFill={SELECTION_BORDER_COLOR}
                transformLabelTextFill="#ffffff"
                distanceGuideStroke={SELECTION_BORDER_COLOR}
                distanceLabelFill={SELECTION_BORDER_COLOR}
                distanceLabelTextFill="#ffffff"
                components={{
                  PageControls: PageToolbar,
                  Tooltip: ContextualTooltip,
                  ContextMenu: () => null,
                }}
              />
            </WorkspaceWrap>
          </PolotnoContainer>
          {!hasSelection && !isDrawMode && (
            <MobileNavbar
              store={store}
              isPagesOpen={isPagesOpen}
              onTogglePages={() => setIsPagesOpen((prev) => !prev)}
            />
          )}

          {isToolSheetOpen && (
            <button
              type="button"
              aria-label={t("templatesEditor.mobile.close_panel") as string}
              onClick={handleDismissSheet}
              className="absolute inset-0 z-[40] cursor-default bg-black/20"
            />
          )}
        </div>

        {renderBottomBar()}

        <MobileToolSheet store={store} />

        <MobileOverflowMenu
          open={isMenuOpen}
          onOpenChange={setIsMenuOpen}
          templateName={templateName}
          isExporting={isExporting}
          onFileNameChange={handleFileNameChange}
          onPrint={handlePrint}
          onShare={handleShare}
        />

        <BottomSheet
          open={isPagesOpen}
          onOpenChange={setIsPagesOpen}
          title={t("templatesEditor.ui.pages") as string}
          bottomOffset={MOBILE_TAB_BAR_HEIGHT}
          backdrop
        >
          <MobilePagesStrip store={store} />
        </BottomSheet>
      </div>
    );
  }
);
