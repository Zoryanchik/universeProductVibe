import type { FC } from "react";

import type { IToolCard } from "@/shared/constants/service-tabs";

import { ToolCardItem } from "../ToolCardItem";
import type { IFeatureHighlight } from "../types";
import { FeatureHighlightsBar } from "./FeatureHighlightsBar";

interface MediumToolCardsViewProps {
  readonly rows: readonly (readonly IToolCard[])[];
  readonly featureHighlights?: readonly IFeatureHighlight[];
}

export const MediumToolCardsView: FC<MediumToolCardsViewProps> = ({
  rows,
  featureHighlights = [],
}) => {
  const midpoint = Math.ceil(rows.length / 2);

  return (
    <div className="flex w-full flex-col gap-4">
      {rows.map((row, rowIndex) => (
        <div key={`row-md-${rowIndex}`} className="contents">
          {rowIndex === midpoint && featureHighlights.length > 0 && (
            <FeatureHighlightsBar highlights={featureHighlights} />
          )}
          <div className="grid grid-cols-4 gap-4">
            {row.map((card) => (
              <ToolCardItem key={card.id} card={card} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
