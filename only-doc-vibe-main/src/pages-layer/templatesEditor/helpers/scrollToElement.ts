import { useCallback } from "react";
import type { StoreType } from "polotno/model/store";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

interface UseScrollToElementProps {
  store: StoreType;
}

export const useScrollToElement = ({ store }: UseScrollToElementProps) => {
  const navigate = useCallback(
    (pageId: string) => {
      const WORKSPACE_INNER_SELECTOR = ".polotno-workspace-inner";

      const pageIndex = store.pages.findIndex((p) => p.id === pageId);
      if (pageIndex < 0) return;

      // Required on mobile where the Workspace uses `renderOnlyActivePage`: the
      // target page must become active before we can scroll it into view.
      store.selectPage(pageId);

      const inner = document.querySelector(WORKSPACE_INNER_SELECTOR);
      if (!inner) return;

      const pageEl = inner.children[pageIndex] as HTMLElement | undefined;
      if (pageEl) {
        pageEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [store]
  );

  const handlePrevPage = useCallback(() => {
    const currentPageIndex = store.pages.findIndex(
      (p) => p.id === store.activePage?.id
    );
    const prevPage = store.pages[currentPageIndex - 1];
    if (prevPage) navigate(prevPage.id);
  }, [store, navigate]);

  const handleNextPage = useCallback(() => {
    const currentPageIndex = store.pages.findIndex(
      (p) => p.id === store.activePage?.id
    );
    const nextPage = store.pages[currentPageIndex + 1];
    if (nextPage) navigate(nextPage.id);
  }, [store, navigate]);

  const handleScrollToElement = useCallback(
    (_element: AnyElement) => {
      const inner = document.querySelector(".polotno-workspace-inner");
      if (!inner) return;

      const pageIndex = store.pages.findIndex(
        (p) => p.id === store.activePage?.id
      );
      if (pageIndex < 0) return;

      const pageEl = inner.children[pageIndex] as HTMLElement | undefined;
      if (!pageEl) return;

      const scale = store.scale;
      const pageRect = pageEl.getBoundingClientRect();
      const innerRect = inner.getBoundingClientRect();

      const element = _element ?? store.selectedElements[0];

      const elCenterX = (element.x + element.width / 2) * scale;
      const elCenterY = (element.y + element.height / 2) * scale;

      const scrollLeft =
        pageRect.left -
        innerRect.left +
        inner.scrollLeft +
        elCenterX -
        inner.clientWidth / 2;
      const scrollTop =
        pageRect.top -
        innerRect.top +
        inner.scrollTop +
        elCenterY -
        inner.clientHeight / 2;

      inner.scrollTo({ left: scrollLeft, top: scrollTop, behavior: "smooth" });
    },
    [store]
  );

  return {
    navigate,
    handlePrevPage,
    handleNextPage,
    handleScrollToElement,
  };
};
