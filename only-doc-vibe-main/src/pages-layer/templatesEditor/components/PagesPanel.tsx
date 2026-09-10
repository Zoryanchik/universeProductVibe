import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";
import { useCallback, type FC } from "react";

import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../ui/IconButton";
import { PagePreview } from "./PagePreview";
import { useScrollToElement } from "../helpers/scrollToElement";
import { Tooltip } from "../ui/Tooltip";

interface PagesPanelProps {
  store: StoreType;
}

export const PagesPanel: FC<PagesPanelProps> = observer(({ store }) => {
  const { t } = useTranslation();
  const pages = store.pages;
  const activePageId = store.activePage?.id;

  const { navigate } = useScrollToElement({ store });

  const handleAddPage = useCallback(() => {
    const activePage = store.activePage;
    const activePageIndex = store.pages.findIndex((p) => p.id === activePageId);
    const newPage = store.addPage({
      width: activePage?.width,
      height: activePage?.height,
      bleed: activePage?.bleed || 0,
    });
    newPage.setZIndex(activePageIndex + 1);
  }, [store, activePageId]);

  return (
    <div className="absolute start-0 end-0 bottom-0 z-[3] border-t border-[var(--color-action-stroke)] bg-[#f5f5f5]">
      <div className="flex items-start gap-4 overflow-x-auto overflow-y-hidden px-4 pt-3 pb-2 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-[2px] [&::-webkit-scrollbar-thumb]:bg-[rgba(0,0,0,0.15)]">
        {pages.map((page, index) => (
          <PagePreview
            key={page.id}
            page={page}
            store={store}
            index={index}
            isSelected={page.id === activePageId}
            onNavigate={navigate}
          />
        ))}
        <div className="flex shrink-0 items-center self-center">
          <Tooltip
            content={t("templatesEditor.ui.page.add_page") as string}
            placement="top"
            offset={15}
          >
            <IconButton iconName="add" onClick={handleAddPage} />
          </Tooltip>
        </div>
      </div>
    </div>
  );
});
