import type { FC } from "react";

import { Image } from "@/shared/ui/image";

import type { IFeatureHighlight } from "../types";

interface FeatureHighlightsBarProps {
  readonly highlights: readonly IFeatureHighlight[];
}

const DashedDivider: FC = () => (
  <div
    className="h-px flex-1"
    style={{
      backgroundImage:
        "repeating-linear-gradient(to right, rgba(0,0,0,0.48) 0px, rgba(0,0,0,0.48) 8px, transparent 8px, transparent 16px)",
    }}
  />
);

export const FeatureHighlightsBar: FC<FeatureHighlightsBarProps> = ({
  highlights,
}) => {
  if (!highlights.length) return null;

  return (
    <div className="flex w-full items-center gap-4 py-1">
      {highlights.map((highlight, index) => (
        <div key={highlight.id} className="contents">
          <DashedDivider />
          <div className="flex shrink-0 items-center gap-2">
            {highlight.iconUrl && (
              <Image src={highlight.iconUrl} alt="" className="h-5 w-5" />
            )}
            <span className="text-body font-medium whitespace-nowrap text-black/87">
              {highlight.label}
            </span>
          </div>
          {index === highlights.length - 1 && <DashedDivider />}
        </div>
      ))}
    </div>
  );
};
