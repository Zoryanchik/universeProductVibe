import { useUserStore } from "../state/user-store";
import { EUserStatus } from "../constants/user-status";

/**
 * Hook to check if the current user is authenticated (registered).
 * Returns true if user status is REGISTERED, false otherwise.
 *
 * Used to determine if the reveal email modal should be shown
 * before allowing file downloads.
 */
export const useIsUserAuthenticated = (): boolean => {
  const user = useUserStore.use.user();

  return user?.status === EUserStatus.REGISTERED;
};

/**
 * Get the current user's authentication status without a hook.
 * Useful for callbacks where hooks can't be used.
 */
export const getIsUserAuthenticated = (): boolean => {
  const user = useUserStore.getState().user;

  return user?.status === EUserStatus.REGISTERED;
};
