import { useState, useCallback } from "react";

import type { FaqItem } from "../model/types";

interface UseFaqSectionProps {
  readonly items: readonly FaqItem[];
  readonly defaultOpenId?: string;
}

interface UseFaqSectionReturn {
  readonly openItemId: string | null;
  readonly toggleItem: (id: string) => void;
  readonly isItemOpen: (id: string) => boolean;
}

export const useFaqSection = ({
  defaultOpenId,
}: UseFaqSectionProps): UseFaqSectionReturn => {
  const [openItemId, setOpenItemId] = useState<string | null>(
    defaultOpenId ?? null
  );

  const toggleItem = useCallback((id: string): void => {
    setOpenItemId((currentId) => (currentId === id ? null : id));
  }, []);

  const isItemOpen = useCallback(
    (id: string): boolean => openItemId === id,
    [openItemId]
  );

  return {
    openItemId,
    toggleItem,
    isItemOpen,
  };
};
