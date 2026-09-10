import { useCallback } from "react";
import type { StoreType } from "polotno/model/store";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

const CLONE_OFFSET = 20;

interface UseCopyElementsProps {
  store: StoreType;
}

export const useCopyElements = ({ store }: UseCopyElementsProps) => {
  const elements = store.selectedElements;

  const handleCopy = useCallback(() => {
    const clonedIds: string[] = [];

    elements.forEach((el: AnyElement) => {
      const cloned = el.clone(
        { x: el.x + CLONE_OFFSET, y: el.y + CLONE_OFFSET },
        { skipSelect: true }
      );
      clonedIds.push(cloned.id);
    });

    store.selectElements(clonedIds);
  }, [store, elements]);

  return { handleCopy };
};
