import { type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useScrollToElement } from "../helpers/scrollToElement";

interface PageNavigationProps {
  store: StoreType;
}

export const PageNavigation: FC<PageNavigationProps> = observer(({ store }) => {
  const pages = store.pages;
  const totalPages = pages.length;
  const currentPageIndex = pages.findIndex(
    (page) => page.id === store.activePage?.id
  );
  const currentPage = currentPageIndex + 1;

  const isSinglePage = totalPages <= 1;
  const isFirstPage = currentPageIndex <= 0;
  const isLastPage = currentPageIndex >= totalPages - 1;

  const { handlePrevPage, handleNextPage } = useScrollToElement({ store });

  return (
    <div className="flex items-center justify-center rounded-lg bg-[var(--color-bg-white-bg)] p-2 shadow-[0px_6px_12px_rgba(0,0,0,0.08),0px_8px_40px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handlePrevPage}
          disabled={isSinglePage || isFirstPage}
          className="flex shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0 outline-none disabled:cursor-default disabled:opacity-20"
        >
          <span className="material-symbols-rounded text-2xl text-[var(--color-common-black)] [font-variation-settings:'FILL'_0,'wght'_300,'GRAD'_0,'opsz'_24]">
            keyboard_arrow_up
          </span>
        </button>

        <span className="text-center font-[Outfit,sans-serif] text-[16px] leading-[22px] font-medium whitespace-nowrap text-[var(--color-common-black)]">
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          onClick={handleNextPage}
          disabled={isSinglePage || isLastPage}
          className="flex shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0 outline-none disabled:cursor-default disabled:opacity-20"
        >
          <span className="material-symbols-rounded text-2xl text-[var(--color-common-black)] [font-variation-settings:'FILL'_0,'wght'_300,'GRAD'_0,'opsz'_24]">
            keyboard_arrow_down
          </span>
        </button>
      </div>
    </div>
  );
});
