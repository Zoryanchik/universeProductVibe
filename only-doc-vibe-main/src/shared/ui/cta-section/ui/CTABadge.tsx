import type { FC } from "react";

import { cn } from "../../../lib/utils/cn";
import type { ICTABadgeProps } from "../model/types";

/**
 * Badge component for CTA section feature highlights.
 * Displays an icon with a label in a styled container.
 */
export const CTABadge: FC<ICTABadgeProps> = ({ icon, label, className }) => (
  <div className={cn("flex items-center gap-2", className)} role="listitem">
    <span className="text-[16px] leading-none" aria-hidden="true">
      {icon}
    </span>
    <span className="text-sm leading-[1.43] font-medium text-[#FFF3E2]">
      {label}
    </span>
  </div>
);
