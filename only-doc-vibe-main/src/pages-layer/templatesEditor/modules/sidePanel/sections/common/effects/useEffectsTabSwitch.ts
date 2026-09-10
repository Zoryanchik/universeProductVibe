import { useEffect, useRef } from "react";
import type { StoreType } from "polotno/model/store";

import { useTemplatesEditorStore } from "../../../../../model/store/templates-editor-store";

const ELEMENT_TYPE_TO_EFFECTS_TAB: Record<string, string> = {
  image: "photos",
  text: "text",
  figure: "elements",
  svg: "photos",
};

export const useEffectsTabSwitch = (
  store: StoreType,
  currentElementTypes: string[]
) => {
  const setEffectsMode = useTemplatesEditorStore.use.setEffectsMode();
  const setSidePanelActiveTab =
    useTemplatesEditorStore.use.setSidePanelActiveTab();
  const elements = store.selectedElements;
  const isSwitchingTabRef = useRef(false);

  useEffect(() => {
    if (elements.length === 0) {
      setEffectsMode(false);

      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const type = (elements[0] as any)?.type;
    if (currentElementTypes.includes(type)) return;

    const targetTab = ELEMENT_TYPE_TO_EFFECTS_TAB[type];

    if (targetTab) {
      isSwitchingTabRef.current = true;
      setSidePanelActiveTab(targetTab);
    } else {
      setEffectsMode(false);
    }
  }, [
    setEffectsMode,
    setSidePanelActiveTab,
    elements,
    elements.length,
    currentElementTypes,
  ]);

  useEffect(() => {
    return () => {
      if (!isSwitchingTabRef.current) {
        setEffectsMode(false);
      }
    };
  }, [setEffectsMode]);
};
