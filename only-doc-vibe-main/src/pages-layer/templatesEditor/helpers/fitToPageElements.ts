import { useCallback } from "react";
import type { StoreType } from "polotno/model/store";
import { getImageSize, getCrop } from "polotno/utils/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

interface UseFitToPageElementsProps {
  store: StoreType;
}

const CROPPABLE_TYPES = new Set(["image", "svg"]);

export const useFitToPageElements = ({ store }: UseFitToPageElementsProps) => {
  const handleFitToPage = useCallback(async () => {
    const elements = store.selectedElements;
    if (elements.length === 0) return;

    const page = store.activePage;
    if (!page) return;

    const pageWidth = page.computedWidth + 2 * page.bleed;
    const pageHeight = page.computedHeight + 2 * page.bleed;

    await store.history.transaction(async () => {
      for (const el of elements as AnyElement[]) {
        const attrs: Record<string, number> = {
          x: -page.bleed,
          y: -page.bleed,
          width: pageWidth,
          height: pageHeight,
          rotation: 0,
        };

        if (CROPPABLE_TYPES.has(el.type) && el.src) {
          if (el.stretchEnabled) {
            attrs.cropX = 0;
            attrs.cropY = 0;
            attrs.cropWidth = 1;
            attrs.cropHeight = 1;
          } else {
            const imageSize = await getImageSize(el.src);
            const crop = getCrop(
              { width: pageWidth, height: pageHeight },
              imageSize
            );
            Object.assign(attrs, crop);
          }
        }

        el.set(attrs);
      }
    });
  }, [store]);

  return { handleFitToPage };
};
