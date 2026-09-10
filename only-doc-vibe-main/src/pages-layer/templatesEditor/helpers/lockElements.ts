import { useCallback } from "react";
import type { StoreType } from "polotno/model/store";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

interface UseLockElementsProps {
  store: StoreType;
}

export const useLockElements = ({ store }: UseLockElementsProps) => {
  const selectedElements = store.selectedElements;
  const isLocked =
    selectedElements.length > 0 &&
    selectedElements.every((el: AnyElement) => el.locked);

  const checkIsLockedPage = useCallback(
    (_page?: AnyElement) => {
      const page = _page ?? store.activePage;
      if (!page) return false;

      return (
        page.children.length > 0 &&
        page.children.every((el: AnyElement) => el.locked)
      );
    },
    [store]
  );

  const handleLock = useCallback(
    (elements?: AnyElement[]) => {
      const targets = elements ?? selectedElements;
      const locked =
        targets.length > 0 && targets.every((el: AnyElement) => el.locked);
      store.history.transaction(() => {
        targets.forEach((el: AnyElement) => {
          el.set({
            draggable: locked,
            contentEditable: locked,
            styleEditable: locked,
            resizable: locked,
          });
        });
      });
    },
    [store, selectedElements]
  );

  return {
    handleLock,
    checkIsLockedPage,
    isLocked,
    elements: selectedElements,
  };
};
