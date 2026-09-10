import type { FC } from "react";

import { cn } from "@/shared/lib/utils/cn";
import { EAnalyticsEvents, trackEvent } from "@/shared/lib/analytics";
import { Link } from "@/shared/ui/Link";

import { SOCIAL_LINKS } from "../model/constants";

export interface SocialLinksProps {
  readonly className?: string;
  readonly slotClassName?: string;
}

export const SocialLinks: FC<SocialLinksProps> = ({
  className,
  slotClassName = "size-10",
}) => {
  return (
    <div
      className={cn("flex items-center gap-5", className)}
      data-testid="footer-social-links"
    >
      {SOCIAL_LINKS.map(({ id, label, href, Icon, inset }) => (
        <Link
          key={id}
          href={href}
          external
          onClick={() =>
            trackEvent(EAnalyticsEvents.FOOTER_TAP, { button: label })
          }
          className={cn(
            "items-center justify-center opacity-90 transition-opacity hover:opacity-100",
            slotClassName
          )}
          ariaLabel={label}
          data-testid={`footer-social-${id}`}
        >
          <span
            className={cn(
              "flex size-full items-center justify-center",
              inset && "p-[12.5%]"
            )}
          >
            <Icon className="size-full" />
          </span>
        </Link>
      ))}
    </div>
  );
};
