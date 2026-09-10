import { useLayoutEffect, useState, type RefObject } from "react";

export interface AnchoredStripCoords {
  top: number;
  left: number;
  width: number;
}

interface UseAnchoredStripParams {
  open: boolean;
  /** Any element rendered inside the toolbar `<nav>` (or the nav itself). */
  anchorRef: RefObject<HTMLElement | null>;
  /** The portal element being positioned (its height is read to place it above the bar). */
  popRef: RefObject<HTMLElement | null>;
  fixedWidth?: number;
  margin?: number;
}

/**
 * Positions a portal strip/popover directly above the toolbar card it belongs to,
 * clamped to the viewport. Shared by the mobile color control and draw bar, which
 * both float a strip above a bottom-anchored `<nav>`.
 */
export const useAnchoredStrip = ({
  open,
  anchorRef,
  popRef,
  fixedWidth,
  margin = 8,
}: UseAnchoredStripParams): AnchoredStripCoords | null => {
  const [coords, setCoords] = useState<AnchoredStripCoords | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);

      return;
    }

    const anchor = anchorRef.current;
    const nav = anchor?.closest("nav") ?? anchor;
    const card =
      (nav?.firstElementChild as HTMLElement | null) ?? nav ?? anchor;
    const cardRect = card?.getBoundingClientRect();
    const pop = popRef.current?.getBoundingClientRect();
    if (!cardRect || !pop) return;

    const top = Math.max(margin, cardRect.top - pop.height - margin);

    if (fixedWidth != null) {
      const width = Math.min(fixedWidth, window.innerWidth - margin * 2);
      const center = cardRect.left + cardRect.width / 2;
      const left = Math.max(
        margin,
        Math.min(center - width / 2, window.innerWidth - width - margin)
      );
      setCoords({ top, left, width });

      return;
    }

    const left = Math.max(
      margin,
      Math.min(cardRect.left, window.innerWidth - cardRect.width - margin)
    );
    setCoords({ top, left, width: cardRect.width });
  }, [open, anchorRef, popRef, fixedWidth, margin]);

  return coords;
};
