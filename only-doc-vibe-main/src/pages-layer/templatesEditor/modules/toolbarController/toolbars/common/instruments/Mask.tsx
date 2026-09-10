import { useCallback, type FC } from "react";

import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../../../../../ui/IconButton";
import { Tooltip } from "../../../../../ui/Tooltip";
import { useTemplatesEditorStore } from "../../../../../model/store/templates-editor-store";

export const MaskInstrument: FC = () => {
  const { t } = useTranslation();
  const isMaskMode = useTemplatesEditorStore.use.maskImageMode();
  const setMaskImageMode = useTemplatesEditorStore.use.setMaskImageMode();
  const setEffectsMode = useTemplatesEditorStore.use.setEffectsMode();
  const setSidePanelActiveTab =
    useTemplatesEditorStore.use.setSidePanelActiveTab();

  const handleClick = useCallback(() => {
    if (isMaskMode) {
      setMaskImageMode(false);
      setSidePanelActiveTab(null);
    } else {
      setEffectsMode(false);
      setMaskImageMode(true);
      setSidePanelActiveTab("elements");
    }
  }, [isMaskMode, setMaskImageMode, setEffectsMode, setSidePanelActiveTab]);

  return (
    <Tooltip content={t("templatesEditor.toolbar.mask") as string}>
      <IconButton
        iconName="masked_transitions"
        onClick={handleClick}
        active={isMaskMode}
      />
    </Tooltip>
  );
};
