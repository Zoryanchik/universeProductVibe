import { useEffect, useRef, useState } from "react";

export const useWaitTimeout = (timeout: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isReady, setIsReady] = useState(timeout === 0);

  useEffect(() => {
    if (timeout === 0) return;

    timeoutRef.current = setTimeout(() => {
      setIsReady(true);
    }, timeout);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [timeout]);

  return isReady;
};
