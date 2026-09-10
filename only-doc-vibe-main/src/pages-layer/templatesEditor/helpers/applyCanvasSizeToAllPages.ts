import { useCallback } from "react";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { useTemplatesEditorStore } from "../model/store/templates-editor-store";

interface UseApplyCanvasSizeToAllPagesProps {
  store: StoreType;
}

export const useApplyCanvasSizeToAllPages = ({
  store,
}: UseApplyCanvasSizeToAllPagesProps) => {
  const { t } = useTranslation();
  const showToast = useTemplatesEditorStore.use.showToast();

  const applyCanvasSizeToAllPages = useCallback(
    (pxWidth: number, pxHeight: number) => {
      store.setSize(pxWidth, pxHeight, true);

      store.pages.forEach((page) => {
        if (page.width !== "auto") {
          page.set({ width: pxWidth });
        }

        if (page.height !== "auto") {
          page.set({ height: pxHeight });
        }
      });

      const isPlural = store.pages.length > 1;

      showToast({
        id: "pages-resized",
        header: t(
          isPlural
            ? "templatesEditor.toasts.page_resized_header_other"
            : "templatesEditor.toasts.page_resized_header_one"
        ) as string,
        content: t(
          isPlural
            ? "templatesEditor.toasts.page_resized_content_other"
            : "templatesEditor.toasts.page_resized_content_one"
        ) as string,
        variant: "success",
      });
    },
    [store, showToast, t]
  );

  return { applyCanvasSizeToAllPages };
};
