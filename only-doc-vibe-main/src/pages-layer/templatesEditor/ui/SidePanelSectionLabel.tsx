import type { FC } from "react";

import { cn } from "@/shared/lib/utils/cn";

export interface SidePanelSectionLabelProps {
  label: string;
  type: "header" | "sub-header";
  align?: "left" | "center" | "right";
}

const alignStyles: Record<
  NonNullable<SidePanelSectionLabelProps["align"]>,
  string
> = {
  left: "text-start",
  center: "text-center",
  right: "text-end",
};

export const SidePanelSectionLabel: FC<SidePanelSectionLabelProps> = ({
  label,
  type,
  align = "left",
}) => {
  return (
    <div
      className={cn(
        "w-full font-[Outfit,sans-serif] font-medium text-[var(--color-text-primary)]",
        type === "header"
          ? "text-[18px] leading-[26px]"
          : "text-[16px] leading-[20px]",
        alignStyles[align]
      )}
    >
      {label}
    </div>
  );
};
