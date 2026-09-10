import logoOnlyDocDark from "@public/assets/header/logo-only-doc-dark.svg?url";
import type { FC } from "react";

import { Image } from "@/shared/ui/image";
import { EAnalyticsEvents, trackEvent } from "@/shared/lib/analytics";
import { PAGE_LINKS } from "@/shared/constants/page-links";
import { localeNavigate } from "@/shared/lib/navigation/localeNavigate";

export const Logo: FC = () => {
  const clickOnLogo = () => {
    trackEvent(EAnalyticsEvents.LOGO_TAP);
    localeNavigate(PAGE_LINKS.HOME);
  };

  return (
    <div className="cursor-pointer" onClick={clickOnLogo} role="button">
      <Image src={logoOnlyDocDark} alt="logo only doc" />
    </div>
  );
};
