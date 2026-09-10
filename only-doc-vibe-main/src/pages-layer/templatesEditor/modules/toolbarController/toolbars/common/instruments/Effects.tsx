import { useCallback, type FC } from "react";

import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../../../../../ui/IconButton";
import { Tooltip } from "../../../../../ui/Tooltip";
import { useTemplatesEditorStore } from "../../../../../model/store/templates-editor-store";

type SidePanel = "photo" | "text" | "shapes";

const SIDE_PANEL_TAB_MAP: Record<SidePanel, string> = {
  text: "text",
  photo: "photos",
  shapes: "elements",
};

interface EffectsInstrumentProps {
  sidePanel: SidePanel;
}

export const EffectsInstrument: FC<EffectsInstrumentProps> = ({
  sidePanel,
}) => {
  const { t } = useTranslation();
  const isEffectsMode = useTemplatesEditorStore.use.effectsMode();
  const setEffectsMode = useTemplatesEditorStore.use.setEffectsMode();
  const setMaskImageMode = useTemplatesEditorStore.use.setMaskImageMode();
  const setSidePanelActiveTab =
    useTemplatesEditorStore.use.setSidePanelActiveTab();

  const handleClick = useCallback(() => {
    if (isEffectsMode) {
      setEffectsMode(false);
      setSidePanelActiveTab(null);
    } else {
      setMaskImageMode(false);
      setEffectsMode(true);
      setSidePanelActiveTab(SIDE_PANEL_TAB_MAP[sidePanel]);
    }
  }, [
    isEffectsMode,
    sidePanel,
    setEffectsMode,
    setMaskImageMode,
    setSidePanelActiveTab,
  ]);

  return (
    <Tooltip content={t("templatesEditor.toolbar.effects") as string}>
      <IconButton
        iconName="wb_iridescent"
        onClick={handleClick}
        active={isEffectsMode}
      />
    </Tooltip>
  );
};
