import type { FC, ReactNode } from "react";

interface ToolbarItemProps {
  iconName: string;
  label: string;
  children: ReactNode;
}

export const ToolbarItem: FC<ToolbarItemProps> = ({ children }) => (
  <>{children}</>
);
