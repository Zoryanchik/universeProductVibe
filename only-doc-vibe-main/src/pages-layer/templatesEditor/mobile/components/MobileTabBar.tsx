import { type CSSProperties, type FC, useMemo } from "react";

import { useTranslation } from "@/shared/lib/translations";

import {
  allTabs,
  type ToolTabConfig,
} from "../../modules/sidePanel/tabsConfig";
import { useTemplatesEditorStore } from "../../model/store/templates-editor-store";

const ACTIVE_COLOR = "var(--color-secondary)";
const INACTIVE_COLOR = "rgba(0, 0, 0, 0.87)";

interface LocalizedTab extends ToolTabConfig {
  label: string;
}

interface MobileTabButtonProps {
  tab: LocalizedTab;
  active: boolean;
  onClick: (name: string) => void;
}

const MobileTabButton: FC<MobileTabButtonProps> = ({
  tab,
  active,
  onClick,
}) => {
  const color = active ? ACTIVE_COLOR : INACTIVE_COLOR;
  const iconStyle: CSSProperties = {
    color,
    fontVariationSettings: `'FILL' ${active ? 1 : 0}, 'wght' 300, 'GRAD' 0, 'opsz' 24`,
  };

  return (
    <button
      type="button"
      onClick={() => onClick(tab.name)}
      className={`flex h-[52px] w-[72px] flex-none flex-col items-center justify-center gap-0.5 rounded-2xl px-1 transition-colors ${
        active ? "bg-[var(--color-secondary-opacity-8)]" : "bg-transparent"
      }`}
    >
      {tab.isCustomIcon ? (
        <img
          src={tab.icon}
          alt={tab.label}
          className="h-6 w-6"
          style={
            active ? { filter: "brightness(0) saturate(100%)" } : undefined
          }
        />
      ) : (
        <span
          className="material-symbols-rounded text-[24px] leading-none"
          style={iconStyle}
        >
          {tab.icon}
        </span>
      )}
      <span
        className="max-w-full truncate font-[Outfit,sans-serif] text-[12px] leading-[14px] font-medium"
        style={{ color }}
      >
        {tab.label}
      </span>
    </button>
  );
};

export const MobileTabBar: FC = () => {
  const { t } = useTranslation();
  const activeTab = useTemplatesEditorStore.use.sidePanelActiveTab();
  const isSheetOpen = useTemplatesEditorStore.use.mobileToolSheetOpen();
  const isDrawMode = useTemplatesEditorStore.use.mobileDrawMode();
  const setSidePanelActiveTab =
    useTemplatesEditorStore.use.setSidePanelActiveTab();
  const setMobileToolSheetOpen =
    useTemplatesEditorStore.use.setMobileToolSheetOpen();
  const setMobileDrawMode = useTemplatesEditorStore.use.setMobileDrawMode();

  const localizedTabs = useMemo<LocalizedTab[]>(
    () => allTabs.map((tab) => ({ ...tab, label: t(tab.labelKey) as string })),
    [t]
  );

  const handleTabClick = (tabName: string) => {
    // Draw enters drawing mode and opens the full draw panel ("choose how to
    // draw"). Like the other tabs, re-tapping it while its panel is open closes
    // the panel — which leaves the compact draw toolbar so the user keeps drawing.
    if (tabName === "draw") {
      if (isDrawMode && isSheetOpen) {
        setMobileToolSheetOpen(false);

        return;
      }

      setMobileDrawMode(true);
      setSidePanelActiveTab("draw");
      setMobileToolSheetOpen(true);

      return;
    }

    if (isDrawMode) setMobileDrawMode(false);

    // Tapping the already-open tab closes its sheet; tapping another switches to it.
    if (isSheetOpen && activeTab === tabName) {
      setMobileToolSheetOpen(false);

      return;
    }

    setSidePanelActiveTab(tabName);
    setMobileToolSheetOpen(true);
  };

  // Only highlight the active tab while its sheet is actually open.
  const highlightedTab = isSheetOpen ? activeTab : null;

  return (
    // z-60 keeps the bar above the in-layout BottomSheet (z-50) so tabs stay
    // visible + tappable while a sheet is open.
    <nav className="relative z-[60] h-[calc(60px+env(safe-area-inset-bottom))] shrink-0 border-t border-black/[0.08] bg-[var(--color-bg-white-bg)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-[60px] items-center gap-1 overflow-x-auto px-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {localizedTabs.map((tab) => (
          <MobileTabButton
            key={tab.name}
            tab={tab}
            active={highlightedTab === tab.name}
            onClick={handleTabClick}
          />
        ))}
      </div>
    </nav>
  );
};
