import React from "react";

import { EAnalyticsEvents, trackEvent } from "@/shared/lib/analytics";
import { Link } from "@/shared/ui/Link";
import { PAGE_LINKS } from "@/shared/constants/page-links";

// Use Tailwind's arbitrary CSS variable support for secondary-filled-500 color
export const resolveConsentText = (
  template: string,
  termsLabel: string,
  privacyLabel: string
): React.ReactNode[] => {
  const parts = template.split(/({terms}|{privacy})/);

  return parts.map((part, index) => {
    if (part === "{terms}")
      return (
        <Link
          key={index}
          className="text-caption text-secondary-filled-500 mt-2 font-normal no-underline"
          href={PAGE_LINKS.TERMS_AND_CONDITIONS}
          onClick={() =>
            trackEvent(EAnalyticsEvents.TERMS_OF_USE_TAP, {
              show_in: "sign_up",
            })
          }
        >
          {termsLabel}
        </Link>
      );

    if (part === "{privacy}")
      return (
        <Link
          key={index}
          className="text-caption text-secondary-filled-500 font-normal no-underline"
          href={PAGE_LINKS.PRIVACY_POLICY}
        >
          {privacyLabel}
        </Link>
      );

    return part;
  });
};
