import React, { type PropsWithChildren, type ReactElement } from "react";
import { type FC } from "react";

interface Props extends PropsWithChildren {
  [key: string]: unknown;
}

export const CustomSlot: FC<Props> = ({ children, ...props }) => {
  const child = React.Children.only(children) as ReactElement;

  return React.cloneElement(child, props);
};
