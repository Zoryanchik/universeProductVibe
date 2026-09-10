import type { FC } from "react";

import { cn } from "@/shared/lib/utils/cn";
import { Image } from "@/shared/ui/image";
import { Link } from "@/shared/ui/Link";
import type { ELanguages } from "@/shared/constants/languages";

import type { IFooterData } from "../model/types";
import { useFooter } from "../lib/useFooter";
import { FooterLinkColumn } from "./FooterLinkColumn";
import { FooterLanguageMenu } from "./FooterLanguageMenu";
import { SocialLinks } from "./SocialLinks";

export interface FooterProps {
  readonly data?: IFooterData;
  readonly path: string;
  readonly currentLang: ELanguages;
  readonly pageLocalizations?: ELanguages[];
}

/**
 * Footer component with logo, link columns, and legal address
 */
export const Footer: FC<FooterProps> = ({
  data,
  currentLang,
  path,
  pageLocalizations,
}) => {
  const { logo, hasData, handleLogoClick, availableLanguages } = useFooter({
    data,
    currentLang,
  });

  if (!hasData || !data) {
    return null;
  }

  return (
    <footer
      className="mx-auto flex w-full flex-col px-4 py-6 md:px-8 md:py-8"
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Content wrapper with blur backdrop */}
      <div
        className={cn(
          "flex w-full flex-col rounded-2xl bg-black backdrop-blur-2xl",
          "gap-4 px-10 py-6",
          "md:gap-10 md:px-10 md:pt-14 md:pb-10"
        )}
      >
        {/* Items row */}
        <div
          className={cn(
            "flex w-full flex-col items-start gap-2",
            "md:grid md:items-start md:gap-x-0 md:gap-y-6",
            "md:grid-cols-[193px_1fr_1fr_1fr_auto]",
            "lg:grid-cols-[minmax(160px,1.25fr)_minmax(140px,1fr)_minmax(140px,1fr)_minmax(180px,1fr)_auto] lg:gap-x-10"
          )}
        >
          <div className="flex min-w-[160px] flex-col min-[1440px]:min-w-[160px] md:min-w-[193px]">
            {logo?.url && (
              <Link
                href="/"
                onClick={handleLogoClick}
                className={cn(
                  "flex items-center",
                  "cursor-pointer",
                  "focus:outline-2 focus:outline-offset-2 focus:outline-white"
                )}
                aria-label="Go to homepage"
                data-testid="footer-logo-link"
              >
                <Image
                  src={logo.url}
                  alt={logo.alternativeText ?? "OnlyDoc Logo"}
                  width={logo.width}
                  height={logo.height}
                  loading="lazy"
                  className="h-[38px] w-auto"
                  data-testid="footer-logo"
                />
              </Link>
            )}
          </div>

          <FooterLinkColumn
            column={data.tools_links}
            locale={currentLang}
            className="w-full py-3 md:w-auto md:px-6 lg:min-w-[140px]"
          />
          <FooterLinkColumn
            column={data.company_links}
            locale={currentLang}
            className="w-full py-3 md:w-auto md:px-6 lg:min-w-[140px]"
          />
          <FooterLinkColumn
            column={data.legal_links}
            locale={currentLang}
            className="w-full py-3 md:w-auto md:px-6 lg:min-w-[160px]"
          />
          <div className="flex flex-col items-start gap-12 self-start md:items-end">
            <FooterLanguageMenu
              currentLang={currentLang}
              path={path}
              availableLanguages={availableLanguages}
              pageLocalizations={pageLocalizations}
            />

            {/* Social links — desktop (below language menu) */}
            <SocialLinks
              className="hidden md:flex md:justify-end md:gap-4"
              slotClassName="size-8"
            />
          </div>
        </div>

        {/* Social links — mobile (centered row) */}
        <SocialLinks
          className="w-full justify-center md:hidden"
          slotClassName="size-10"
        />

        {/* Legal address */}
        {data.legal_address && (
          <p
            className={cn(
              "text-caption tracking-[0.26px] text-white/80",
              "text-center whitespace-pre-line",
              "w-full"
            )}
          >
            {data.legal_address}
          </p>
        )}
      </div>
    </footer>
  );
};
