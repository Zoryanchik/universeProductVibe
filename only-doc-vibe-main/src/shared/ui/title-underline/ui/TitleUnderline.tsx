import React from "react";

import {
  SVG_VIEWBOX_HEIGHT,
  SVG_VIEWBOX_WIDTH,
  UNDERLINE_PATH,
} from "../model/constants";

interface TitleUnderlineProps {
  readonly width: number;
  readonly className?: string;
}

export const TitleUnderline: React.FC<TitleUnderlineProps> = ({
  width,
  className,
}) => {
  const aspectRatio = SVG_VIEWBOX_HEIGHT / SVG_VIEWBOX_WIDTH;
  const height = width * aspectRatio;

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}`}
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path d={UNDERLINE_PATH} fill="var(--color-secondary-light)" />
    </svg>
  );
};
