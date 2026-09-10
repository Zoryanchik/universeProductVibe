import type { FC } from "react";
import { cn } from "@universe-forma/ui-pes";

import {
  FORMAT_GROUP_BADGE_CLASS,
  getFormatGroupForType,
} from "@/entities/documents";

interface Props {
  type: string;
  className?: string;
}

export const FileTypeBadge: FC<Props> = ({ type, className }) => {
  const group = getFormatGroupForType(type);

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md px-2 text-[11px] font-semibold uppercase",
        FORMAT_GROUP_BADGE_CLASS[group],
        className
      )}
    >
      {type.toUpperCase()}
    </span>
  );
};
