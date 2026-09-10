import type { FC, ReactNode } from "react";

import { useInitUser } from "@/entities/user";

interface UserIniterProps {
  children?: ReactNode;
}

/**
 * Component that initializes user session on mount.
 * Should be placed at the app root level to ensure session is established
 * before any authenticated requests are made.
 */
export const UserIniter: FC<UserIniterProps> = ({ children }) => {
  useInitUser();

  return <>{children}</>;
};
