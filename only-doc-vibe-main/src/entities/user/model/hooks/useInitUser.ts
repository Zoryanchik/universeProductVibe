import { useEffect, useRef, useState } from "react";

import { ensureUserSession } from "../../api/services";
import { setUser, useUserStore } from "../state/user-store";

interface UseInitUserResult {
  isLoading: boolean;
  isInitialized: boolean;
  error: Error | null;
}

/**
 * Hook to initialize user session on app load.
 * Attempts to fetch current user, if unauthorized - creates anonymous session.
 * Updates user store with the result.
 */
export const useInitUser = (): UseInitUserResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const initRef = useRef(false);

  const currentUser = useUserStore.use.user();

  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (initRef.current) return;

    initRef.current = true;

    const initUser = async (): Promise<void> => {
      try {
        const user = await ensureUserSession();
        // setUser also updates UserStorage
        setUser(user);
        setIsInitialized(true);
      } catch (err) {
        console.error("Failed to initialize user session:", err);
        setError(err instanceof Error ? err : new Error("Failed to init user"));
      } finally {
        setIsLoading(false);
      }
    };

    // Always re-validate session on app load to sync with backend
    initUser();
  }, []);

  return {
    isLoading,
    isInitialized: isInitialized || currentUser !== null,
    error,
  };
};
