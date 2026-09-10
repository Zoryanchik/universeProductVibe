import React from "react";

import { useTitle } from "../lib/useTitle";
import type { TitleProps } from "../model/types";

export const Title: React.FC<TitleProps> = ({
  level = "h2",
  variant = "desktop-title-2",
  children,
  className = "",
  align = "center",
  style = {},
  id,
}) => {
  const Component = level;
  const { combinedClasses } = useTitle({ variant, align, className });

  return (
    <Component id={id} className={combinedClasses} style={style}>
      {children}
    </Component>
  );
};
