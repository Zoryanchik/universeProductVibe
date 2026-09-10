import { observer } from "mobx-react-lite";
import { useCallback, useMemo, type FC } from "react";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import ActionButtons from "../ui/ActionButtons";
import { useDeletePage } from "../helpers/deletePage";
import { useLockElements } from "../helpers/lockElements";
import { PAGES_TOOLBAR_GAP, PAGES_TOOLBAR_HEIGHT } from "../constants/sizes";

interface PageToolbarProps {
  store: StoreType;
  page: StoreType["pages"][0];
  width: number;
  height: number;
  xPadding: number;
  yPadding: number;
}

export const PageToolbar: FC<PageToolbarProps> = observer(
  ({ store, page, width, xPadding, yPadding }) => {
    const { t } = useTranslation();
    const hasManyPages = store.pages.length > 1;
    const pageIndex = store.pages.indexOf(page);
    const isFirst = pageIndex === 0;
    const isLast = pageIndex === store.pages.length - 1;

    const { handleLock, checkIsLockedPage } = useLockElements({ store });
    const { handleDeletePage } = useDeletePage({ store });
    const pageElements = page.children;
    const isPageLocked = checkIsLockedPage(page);

    const handleTogglePageLock = useCallback(() => {
      const willLock = !isPageLocked;
      handleLock(page.children);
      if (willLock && store.tool === "draw") {
        store.setTool("selection");
      }
    }, [handleLock, page, isPageLocked, store]);

    const handleMoveUp = useCallback(() => {
      if (pageIndex > 0) {
        page.setZIndex(pageIndex - 1);
      }
    }, [page, pageIndex]);

    const handleMoveDown = useCallback(() => {
      if (pageIndex < store.pages.length - 1) {
        page.setZIndex(pageIndex + 1);
      }
    }, [page, pageIndex, store.pages.length]);

    const handleAddPage = useCallback(() => {
      const newPage = store.addPage({
        bleed: store.activePage?.bleed || 0,
      });
      newPage.setZIndex(pageIndex + 1);
    }, [store, pageIndex]);

    const handleDuplicate = useCallback(() => {
      page.clone();
    }, [page]);

    const actions = useMemo(() => {
      return [
        {
          iconName: "expand_less",
          onClick: handleMoveUp,
          disabled: isFirst,
          visible: hasManyPages,
          hint: t("templatesEditor.ui.page.previous_page") as string,
        },
        {
          iconName: "expand_more",
          onClick: handleMoveDown,
          disabled: isLast,
          visible: hasManyPages,
          hint: t("templatesEditor.ui.page.next_page") as string,
        },
        {
          iconName: "add",
          onClick: handleAddPage,
          visible: true,
          hint: t("templatesEditor.ui.page.add_new_page") as string,
        },
        {
          iconName: "content_copy",
          onClick: handleDuplicate,
          visible: true,
          hint: t("templatesEditor.ui.page.duplicate_page") as string,
        },
        {
          iconName: isPageLocked ? "lock" : "lock_open",
          onClick: handleTogglePageLock,
          disabled: pageElements.length === 0,
          visible: true,
          active: isPageLocked,
          hint: isPageLocked
            ? (t("templatesEditor.ui.page.unlock_page") as string)
            : (t("templatesEditor.ui.page.lock_page") as string),
        },
        {
          iconName: "delete_forever",
          onClick: () => handleDeletePage(page),
          disabled: isPageLocked,
          visible: hasManyPages,
          hint: t("templatesEditor.ui.page.delete_page") as string,
        },
      ];
    }, [
      handleMoveUp,
      handleMoveDown,
      handleAddPage,
      handleDuplicate,
      handleDeletePage,
      handleTogglePageLock,
      hasManyPages,
      isFirst,
      isLast,
      isPageLocked,
      pageElements.length,
      page,
      t,
    ]);

    const top = yPadding - PAGES_TOOLBAR_HEIGHT - PAGES_TOOLBAR_GAP;

    return (
      <div
        className="pointer-events-none absolute flex justify-end"
        style={{ top, right: xPadding, width }}
      >
        <ActionButtons actions={actions} />
      </div>
    );
  }
);
