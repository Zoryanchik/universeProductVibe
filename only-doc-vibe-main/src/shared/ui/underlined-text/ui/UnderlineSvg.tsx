import React from "react";

import {
  SVG_HEIGHT,
  SVG_WIDTH,
  UNDERLINE_OFFSET_Y,
  UNDERLINE_PATH,
} from "../model/constants";

interface UnderlineSvgProps {
  readonly width: number;
  readonly color: string;
}

export const UnderlineSvg: React.FC<UnderlineSvgProps> = ({ width, color }) => (
  <svg
    className="absolute start-0 bottom-0 z-0"
    width={width}
    height={SVG_HEIGHT}
    viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
    style={{
      transform: `translateY(${UNDERLINE_OFFSET_Y}px)`,
    }}
    aria-hidden="true"
    preserveAspectRatio="none"
  >
    <path d={UNDERLINE_PATH} fill={color} />
  </svg>
);
