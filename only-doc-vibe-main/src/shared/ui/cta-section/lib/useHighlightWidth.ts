import { useRef, useState, useEffect } from "react";

import type { IUseHighlightWidthReturn } from "../model/types";

/**
 * Custom hook for measuring highlight text width.
 * Automatically updates on window resize.
 *
 * @param highlight - The text content to measure
 * @returns Object containing ref to attach to element and measured width
 *
 * @example
 * const { highlightRef, width } = useHighlightWidth("Highlighted Text");
 * return (
 *   <span ref={highlightRef}>{text}</span>
 *   {width > 0 && <Underline width={width} />}
 * );
 */
export const useHighlightWidth = (
  highlight: string
): IUseHighlightWidthReturn => {
  const highlightRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const updateWidth = (): void => {
      if (highlightRef.current) {
        setWidth(highlightRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, [highlight]);

  return { highlightRef, width };
};
