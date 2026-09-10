import type { StoreType } from "polotno/model/store";
import { useCallback, useEffect, useRef } from "react";
import { useCopyStyle } from "polotno/toolbar/use-copy-style";

import { useTranslation } from "@/shared/lib/translations";

import { useTemplatesEditorStore } from "../model/store/templates-editor-store";

interface UseCopyStyleElementsProps {
  store: StoreType;
}

export const useCopyStyleElements = ({ store }: UseCopyStyleElementsProps) => {
  const { t } = useTranslation();
  const showToast = useTemplatesEditorStore.use.showToast();
  const hideToast = useTemplatesEditorStore.use.hideToast();
  const { elementToCopy, disabled, setElementToCopy } = useCopyStyle(store);

  const isCopyStyleActive = !!elementToCopy;
  const isCopyStyleActiveRef = useRef<boolean>(isCopyStyleActive);
  isCopyStyleActiveRef.current = isCopyStyleActive;

  const wasCancelledRef = useRef(false);
  const prevActiveRef = useRef(false);

  useEffect(() => {
    if (
      prevActiveRef.current &&
      !isCopyStyleActive &&
      !wasCancelledRef.current
    ) {
      showToast({
        id: "copy-style-applied",
        header: t("templatesEditor.toasts.copy_style_applied_header") as string,
        content: t(
          "templatesEditor.toasts.copy_style_applied_content"
        ) as string,
        variant: "success",
      });
    }

    wasCancelledRef.current = false;
    prevActiveRef.current = isCopyStyleActive;
  }, [isCopyStyleActive, showToast, t]);

  useEffect(() => {
    return () => {
      hideToast("copy-style");
    };
  }, [hideToast]);

  const handleCopyStyle = useCallback(() => {
    setElementToCopy(store.selectedElements[0]);
    showToast({
      id: "copy-style",
      header: t("templatesEditor.toasts.copy_style_header") as string,
      content: t("templatesEditor.toasts.copy_style_content") as string,
      variant: "success",
      autoCloseOnCondition: () => !isCopyStyleActiveRef.current,
      onClose: () => {
        wasCancelledRef.current = true;
        setElementToCopy(null);
      },
      closeLabel: t("templatesEditor.common.cancel") as string,
    });
  }, [store, setElementToCopy, showToast, t]);

  return {
    handleCopyStyle,
    isCopyStyleActive,
    isCopyStyleDisabled: disabled,
  };
};
