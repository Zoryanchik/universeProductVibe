import type { FC } from "react";

import type { IToolCard } from "@/shared/constants/service-tabs";

import { ToolCardItem } from "../ToolCardItem";

interface LargeToolCardsViewProps {
  readonly rows: readonly (readonly IToolCard[])[];
}

export const LargeToolCardsView: FC<LargeToolCardsViewProps> = ({ rows }) => {
  return (
    <div className="flex w-full flex-col gap-4">
      {rows.map((row, rowIndex) => (
        <div key={`row-lg-${rowIndex}`} className="grid grid-cols-4 gap-4">
          {row.map((card) => (
            <ToolCardItem key={card.id} card={card} />
          ))}
        </div>
      ))}
    </div>
  );
};
