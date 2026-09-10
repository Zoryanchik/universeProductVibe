import type { FC } from "react";

import { cn } from "@/shared/lib/utils/cn";
import { Link } from "@/shared/ui/Link";
import type { ELanguages } from "@/shared/constants/languages";
import { EAnalyticsEvents, trackEvent } from "@/shared/lib/analytics";

import type { ILinkColumn } from "../model/types";
import { getLinkUrl } from "../lib/getLinkUrl";

export interface FooterLinkColumnProps {
  readonly column: ILinkColumn;
  readonly locale: ELanguages;
  readonly className?: string;
}

/**
 * Footer link column component
 * Renders a column of links with an optional title
 */
export const FooterLinkColumn: FC<FooterLinkColumnProps> = ({
  column,
  locale,
  className,
}) => {
  if (!column.link_item || column.link_item.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("flex flex-col items-start gap-3", className)}
      data-testid={`static-pages-group-${column.title ?? ""}`}
    >
      {column.title && (
        <span
          className="text-caption-overline font-extrabold tracking-normal text-white uppercase"
          data-testid={`group-title-${column.title}`}
        >
          {column.title}
        </span>
      )}
      {column.link_item.map((link) => (
        <Link
          key={link.id}
          href={getLinkUrl(link, locale)}
          variant="secondary"
          size="sm"
          className="text-white transition-colors hover:text-white/80"
          ariaLabel={link.title}
          onClick={() =>
            trackEvent(EAnalyticsEvents.FOOTER_TAP, { button: link.title })
          }
        >
          {link.title}
        </Link>
      ))}
    </div>
  );
};
