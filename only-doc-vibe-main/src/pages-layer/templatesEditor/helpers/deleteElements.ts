import { useCallback } from "react";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { useTemplatesEditorStore } from "../model/store/templates-editor-store";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

interface UseDeleteElementsProps {
  store: StoreType;
}

export const useDeleteElements = ({ store }: UseDeleteElementsProps) => {
  const { t } = useTranslation();
  const showToast = useTemplatesEditorStore.use.showToast();

  const selectedElements = store.selectedElements;

  const handleDelete = useCallback(
    (elements?: AnyElement[]) => {
      const targets = elements ?? selectedElements;
      const ids = targets.map((el: AnyElement) => el.id);
      showToast({
        id: "delete-elements",
        header: t(
          "templatesEditor.toasts.delete_confirmation_header"
        ) as string,
        content: t("templatesEditor.toasts.delete_elements_content") as string,
        variant: "warning",
        button: {
          label: t("templatesEditor.common.delete") as string,
          onClick: () => store.deleteElements(ids),
        },
      });
    },
    [store, selectedElements, showToast, t]
  );

  return { handleDelete };
};
