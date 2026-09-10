import { useEffect } from "react";

export const useDisableScroll = (
  { isScrollDisabled = true }: { isScrollDisabled?: boolean } = {
    isScrollDisabled: true,
  }
): void => {
  useEffect(() => {
    document.body.style.overflow = isScrollDisabled ? "hidden" : "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isScrollDisabled]);
};
