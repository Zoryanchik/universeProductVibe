import React from "react";

import { useUnderlinedText } from "../lib/useUnderlinedText";
import { DEFAULT_UNDERLINE_COLOR } from "../model/constants";
import type { UnderlinedTextProps } from "../model/types";
import { UnderlineSvg } from "./UnderlineSvg";

export const UnderlinedText: React.FC<UnderlinedTextProps> = ({
  prefix,
  highlight,
  suffix,
  className = "",
  underlineColor = DEFAULT_UNDERLINE_COLOR,
}) => {
  const { highlightRef, underlineWidth } = useUnderlinedText(highlight);

  return (
    <span className={className}>
      {prefix && <span>{prefix} </span>}
      <span className="relative inline-block">
        <span ref={highlightRef} className="relative z-10">
          {highlight}
        </span>
        {underlineWidth > 0 && (
          <UnderlineSvg width={underlineWidth} color={underlineColor} />
        )}
      </span>
      {suffix && <span> {suffix}</span>}
    </span>
  );
};
