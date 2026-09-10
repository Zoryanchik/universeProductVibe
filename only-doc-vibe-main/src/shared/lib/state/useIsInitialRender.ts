import { useEffect, useState } from "react";

export const useIsInitialRender = (): boolean => {
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    setIsInitialRender(false);
  }, []);

  return isInitialRender;
};
