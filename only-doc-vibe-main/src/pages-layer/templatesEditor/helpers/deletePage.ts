import { useCallback } from "react";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { useTemplatesEditorStore } from "../model/store/templates-editor-store";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPage = any;

interface UseDeletePageProps {
  store: StoreType;
}

export const useDeletePage = ({ store }: UseDeletePageProps) => {
  const { t } = useTranslation();
  const showToast = useTemplatesEditorStore.use.showToast();

  const handleDeletePage = useCallback(
    (page: AnyPage) => {
      const hasManyPages = store.pages.length > 1;
      if (hasManyPages) {
        showToast({
          id: "delete-page",
          header: t(
            "templatesEditor.toasts.delete_confirmation_header"
          ) as string,
          content: t("templatesEditor.toasts.delete_page_content") as string,
          variant: "warning",
          button: {
            label: t("templatesEditor.common.delete") as string,
            onClick: () => store.deletePages([page.id]),
          },
        });
      }
    },
    [store, showToast, t]
  );

  return { handleDeletePage };
};
