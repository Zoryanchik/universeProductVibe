import React from "react";
import { ReactComponent as UploadIcon } from "@public/assets/icons/upload.svg?react";

import { EIconId } from "../../../constants/icon-id";
import { DEFAULT_ICON_SIZE } from "../model/constants";
import type { IconSize } from "../model/types";

export const getIconById = (
  iconId?: EIconId,
  iconSize?: IconSize
): React.ReactNode | undefined => {
  if (!iconId) return undefined;

  const size = iconSize ?? DEFAULT_ICON_SIZE;

  const iconWrapperStyle: React.CSSProperties = {
    width: size.width,
    height: size.height,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  switch (iconId) {
    case EIconId.UPLOAD:
      return (
        <span style={iconWrapperStyle}>
          <UploadIcon
            width={size.width}
            height={size.height}
            style={{
              width: `${size.width}px`,
              height: `${size.height}px`,
              display: "block",
            }}
          />
        </span>
      );
    default:
      return undefined;
  }
};
