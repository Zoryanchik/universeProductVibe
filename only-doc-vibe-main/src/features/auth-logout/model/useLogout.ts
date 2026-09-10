import { useCallback } from "react";

import { localeNavigate } from "@/shared/lib/navigation/localeNavigate";
import { PAGE_LINKS } from "@/shared/constants/page-links";
import { resetModalsStore } from "@/shared/lib/modals/modals-store";
import { logger } from "@/shared/lib/utils/logger";

import { clearUser } from "@/entities/user";
import { clearDocumentsStorage } from "@/entities/documents";

import { createAnonymousSession, logout } from "../api/services";

export const useLogout = (): (() => Promise<void>) => {
  return useCallback(async () => {
    logger.debug("[useLogout] Starting logout process");

    try {
      await logout();
      logger.debug("[useLogout] Logout API call successful");
    } catch (error) {
      // TODO: Consider reporting persistent logout failures to error tracking
      logger.warn(
        "[useLogout] Logout API call failed, proceeding with local cleanup",
        error
      );
    }

    clearDocumentsStorage();
    resetModalsStore();
    clearUser();

    try {
      await createAnonymousSession();
      logger.debug("[useLogout] Anonymous session created successfully");
    } catch (error) {
      // TODO: Consider retry logic or user notification for anonymous session failures
      logger.warn("[useLogout] Failed to create anonymous session", error);
    }

    logger.debug("[useLogout] Navigating to home page");
    localeNavigate(PAGE_LINKS.HOME);
  }, []);
};
