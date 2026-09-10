import { useEffect, useRef, useState } from "react";

interface UseUnderlinedTextReturn {
  readonly highlightRef: React.RefObject<HTMLSpanElement | null>;
  readonly underlineWidth: number;
}

export const useUnderlinedText = (
  highlight: string
): UseUnderlinedTextReturn => {
  const highlightRef = useRef<HTMLSpanElement>(null);
  const [underlineWidth, setUnderlineWidth] = useState<number>(0);

  useEffect(() => {
    if (highlightRef.current) {
      setUnderlineWidth(highlightRef.current.offsetWidth);
    }
  }, [highlight]);

  return { highlightRef, underlineWidth };
};
