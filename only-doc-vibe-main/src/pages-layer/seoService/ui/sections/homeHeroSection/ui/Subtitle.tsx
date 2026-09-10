import React from "react";

import { useSubtitle } from "../lib/useSubtitle";

interface SubtitleProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export const Subtitle: React.FC<SubtitleProps> = ({
  children,
  className = "",
}) => {
  const { combinedClasses } = useSubtitle({ className });

  return <p className={combinedClasses}>{children}</p>;
};
