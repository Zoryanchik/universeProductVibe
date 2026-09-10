import type { StoreType } from "polotno/model/store";

import { isMobileDevice } from "@/shared/lib/device/is-mobile";

const DESKTOP_SCALE = 0.5;
const MOBILE_HORIZONTAL_PADDING = 32;
// Space taken by the mobile header + bottom bar + a little breathing room, so the
// whole page (not just its width) is visible on load.
const MOBILE_VERTICAL_RESERVED = 180;

/**
 * Mobile fits the whole active page inside the visible canvas area (contain), so
 * the entire document is visible on load; desktop uses a fixed zoom.
 */
export const applyInitialScale = (store: StoreType) => {
  if (!isMobileDevice()) {
    store.setScale(DESKTOP_SCALE);

    return;
  }

  if (!store.width || !store.height) return;

  const availableWidth = window.innerWidth - MOBILE_HORIZONTAL_PADDING;
  const availableHeight = window.innerHeight - MOBILE_VERTICAL_RESERVED;

  const fitWidthScale = availableWidth / store.width;
  const fitHeightScale = availableHeight / store.height;

  store.setScale(Math.min(fitWidthScale, fitHeightScale, 1));
};
