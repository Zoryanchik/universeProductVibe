import React, { useMemo } from "react";
import { cn, Button } from "@universe-forma/ui-pes";
import headerDivider from "@public/assets/header/divider.svg?url";
import menuIcon from "@public/assets/header/mobile-menu-icon.svg?url";
import closeIcon from "@public/assets/header/close-icon.svg?url";

import { Image } from "@/shared/ui/image";
import { Link } from "@/shared/ui/Link";
import { EAnalyticsEvents, trackEvent } from "@/shared/lib/analytics";
import { navigateThroughURL } from "@/shared/lib/seo/navigate-through-url";
import { PAGE_LINKS } from "@/shared/constants/page-links";

import type { INavbarProps } from "../model/types";
import { useNavbar } from "../model/useNavbar";
import { MobileToolsMenu } from "./mobileToolsMenu";

import { LanguageMenu, ToolsMenu } from "./";

const TOOLS_MENU_LINK_IDS = new Set([
  "all_tools",
  "convert_pdf",
  "convert_pdf_page",
]);
const resolveMenuId = (linkId: string): "all_tools" | "convert_pdf" | null => {
  if (linkId === "all_tools") return "all_tools";

  if (linkId === "convert_pdf" || linkId === "convert_pdf_page") {
    return "convert_pdf";
  }

  return null;
};

export const Navbar: React.FC<INavbarProps> = ({
  navbarData,
  locale,
  pathname,
  pageLocalizations,
  pdfTemplatesLabel,
}) => {
  const {
    logo,
    auth,
    loginLink,
    logoutLink,
    navItems,
    isLoggedIn,
    isMenuOpened,
    contactUsNavItem,
    availableLanguages,
    toolsMenuMap,
    handleLogoClick,
    setIsMenuOpened,
    logout,
  } = useNavbar({ navbarData, locale, pathname });
  const mobileMenuGroups = useMemo(() => {
    const combined = [
      ...(toolsMenuMap.all_tools ?? []),
      ...(toolsMenuMap.convert_pdf ?? []),
    ];
    const seen = new Set<string>();

    return combined.filter((group) => {
      if (seen.has(group.title)) return false;

      seen.add(group.title);

      return true;
    });
  }, [toolsMenuMap]);

  const crawlableToolLinks = useMemo(() => {
    const seen = new Set<string>();

    return Object.values(toolsMenuMap)
      .flat()
      .flatMap((group) => group.items)
      .filter((item) => {
        if (!item.url || seen.has(item.url)) return false;

        seen.add(item.url);

        return true;
      });
  }, [toolsMenuMap]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex w-full select-none",
        "bg-transparent transition-colors duration-300"
      )}
      data-testid="navbar-header"
    >
      <div
        className={cn(
          "mx-auto flex w-full items-center px-8 py-6",
          "max-md:min-h-[56px] max-md:justify-between max-md:px-4 max-md:py-2"
        )}
      >
        <div
          className={cn(
            "flex min-h-[72px] w-full items-center gap-10 rounded-2xl bg-black px-8 py-3",
            "max-md:min-h-10 max-md:rounded-xl max-md:px-4 max-md:py-2"
          )}
        >
          {logo?.url && (
            <button
              onClick={() => {
                trackEvent(EAnalyticsEvents.LOGO_TAP);
                handleLogoClick();
              }}
              className="relative flex cursor-pointer items-center"
              aria-label="Go to homepage"
              data-testid="navbar-logo-link"
            >
              <Image
                src={logo.url}
                alt={logo.alternativeText ?? "Logo"}
                width={logo.width}
                height={logo.height}
                loading="eager"
                className="h-10 w-auto max-md:h-8"
              />
            </button>
          )}
          {/* Primary navigation */}
          <nav
            aria-label="Primary navigation"
            className="flex flex-1 items-center justify-center gap-2 max-md:hidden"
            data-testid="navbar-desktop-links"
          >
            <Link
              className={cn(
                "text-body-emph flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-bold text-white transition-colors duration-200",
                "hover:bg-white/12 hover:text-white hover:opacity-100"
              )}
              href={PAGE_LINKS.PDF_TEMPLATES}
              data-testid="pdf-templates-link"
            >
              {pdfTemplatesLabel}
            </Link>
            {navItems
              .filter((item) => item.link_id !== "pdf_viewer")
              .map((item) => {
                if (TOOLS_MENU_LINK_IDS.has(item.link_id)) {
                  const menuId = resolveMenuId(item.link_id);
                  if (!menuId) return null;

                  const groups = toolsMenuMap[menuId];

                  // If CMS didn't provide dropdown groups, keep item clickable as a regular link.
                  if (!groups?.length) {
                    return (
                      <Link
                        key={item.id}
                        className={cn(
                          "text-body-emph flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-bold text-white transition-colors duration-200",
                          "hover:bg-white/12 hover:text-white hover:opacity-100"
                        )}
                        href={navigateThroughURL(item.url, locale)}
                        onClick={() => {
                          trackEvent(EAnalyticsEvents.TOOLS_TAP);
                          trackEvent(EAnalyticsEvents.CONVERT_PAGE_TAP);
                        }}
                        data-testid={
                          item.url
                            ? `${item.url.replace("/", "")}-link`
                            : undefined
                        }
                      >
                        {item.title}
                      </Link>
                    );
                  }

                  return (
                    <ToolsMenu
                      key={item.id}
                      item={item}
                      groups={groups}
                      locale={locale}
                    />
                  );
                }

                return (
                  <Link
                    key={item.id}
                    className={cn(
                      "text-body-emph flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-bold text-white transition-colors duration-200",
                      "hover:bg-white/12 hover:text-white hover:opacity-100"
                    )}
                    href={navigateThroughURL(item.url, locale)}
                    data-testid={
                      item.url ? `${item.url.replace("/", "")}-link` : undefined
                    }
                  >
                    {item.title}
                  </Link>
                );
              })}
          </nav>

          <nav
            aria-label="Utility navigation"
            className="flex items-center justify-end gap-2 max-md:hidden"
          >
            {/* Language selector */}
            <div className="self-ctretch flex items-center max-md:hidden">
              <LanguageMenu
                isHeaderDark
                currentLang={locale}
                availableLanguages={availableLanguages}
                pathname={pathname}
                pageLocalizations={pageLocalizations}
              />
            </div>

            <Image
              src={headerDivider}
              alt=""
              aria-hidden
              className="h-8 w-[2px]"
            />

            {/* Contact us */}
            {contactUsNavItem && (
              <Link
                key={contactUsNavItem?.id ?? "contact_us"}
                className={cn(
                  "text-body-emph flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-bold text-white transition-colors duration-200",
                  "hover:bg-white/12 hover:text-white"
                )}
                href={navigateThroughURL(
                  contactUsNavItem?.url || PAGE_LINKS.CONTACT_US,
                  locale
                )}
                onClick={() => trackEvent(EAnalyticsEvents.CONTACT_US_TAP)}
              >
                {contactUsNavItem?.title}
              </Link>
            )}

            {/* Login button */}
            {!isLoggedIn && loginLink && (
              <Link
                variant="unstyled"
                href={navigateThroughURL(PAGE_LINKS.LOGIN, locale)}
                className={cn(
                  "text-body-emph flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-white px-4 py-3 text-[color:var(--color-action-main)] transition-colors duration-200",
                  "hover:bg-white/90 hover:text-[color:var(--color-action-main)]"
                )}
                onClick={() => trackEvent(EAnalyticsEvents.LOG_IN_TAP)}
                data-testid="navbar-login-button"
              >
                {loginLink.title}
              </Link>
            )}
            {isLoggedIn && (
              <>
                <Link
                  href={navigateThroughURL(PAGE_LINKS.DASHBOARD, locale)}
                  className={cn(
                    "text-body-emph bg-primary flex min-h-12 cursor-pointer items-center justify-center rounded-xl px-4 py-3 text-black transition-colors duration-200",
                    "hover:opacity-90"
                  )}
                >
                  Dashboard
                </Link>
                <div data-testid="navbar-desktop-auth-controls">
                  <Button
                    variant="outlined"
                    size="md"
                    onClick={logout}
                    className="border-white bg-white text-[color:var(--color-action-main)] hover:bg-white/90"
                    data-testid="navbar-log_out-button"
                  >
                    {logoutLink?.title ?? auth?.link?.[0]?.title ?? "Logout"}
                  </Button>
                </div>
              </>
            )}
          </nav>

          <nav className="ms-auto flex md:hidden">
            {/* MobileMenuButton */}
            {!isMenuOpened && (
              <button
                onClick={() => setIsMenuOpened(!isMenuOpened)}
                aria-label="Menu"
                data-testid="navbar-mobile-menu-button"
                className="flex items-center justify-center rounded-xl p-2"
              >
                <Image
                  src={menuIcon}
                  alt="menu icon"
                  className="h-6 w-6 object-contain invert"
                  data-testid="navbar-mobile-menu-icon"
                />
              </button>
            )}
          </nav>

          {crawlableToolLinks.length > 0 && (
            <nav className="sr-only" aria-hidden="true">
              {crawlableToolLinks.map((item) => (
                <a
                  key={item.id}
                  href={navigateThroughURL(item.url, locale)}
                  tabIndex={-1}
                >
                  {item.title}
                </a>
              ))}
            </nav>
          )}
        </div>
        {/* Mobile Navigation */}
        <nav
          className={cn(
            "fixed inset-0 z-50 flex h-dvh w-full flex-col overflow-hidden rounded-2xl bg-[var(--color-common-black)] px-2 pt-[72px] pb-6 md:hidden",
            "transition-all duration-300 ease-out",
            {
              "pointer-events-none opacity-0": !isMenuOpened,
              "pointer-events-auto opacity-100": isMenuOpened,
            }
          )}
          data-testid="navbar-mobile-menu"
        >
          {logo?.url && (
            <button
              onClick={() => {
                trackEvent(EAnalyticsEvents.LOGO_TAP);
                handleLogoClick();
              }}
              className="absolute start-5 top-6 flex cursor-pointer items-center"
              aria-label="Go to homepage"
              data-testid="navbar-mobile-logo-link"
            >
              <Image
                src={logo.url}
                alt={logo.alternativeText ?? "Logo"}
                width={logo.width}
                height={logo.height}
                loading="eager"
                className="h-8 w-auto"
              />
            </button>
          )}
          <button
            onClick={() => setIsMenuOpened(false)}
            data-testid="navbar-mobile-close-button"
            aria-label="Close"
            className="absolute end-3 top-4 flex items-center justify-center rounded-xl p-2"
          >
            <Image
              src={closeIcon}
              alt="Close menu"
              className="h-6 w-6 object-contain invert"
              data-testid="navbar-mobile-close-icon"
            />
          </button>

          <div className="flex min-h-0 w-full flex-1 flex-col px-2">
            <div
              className="min-h-0 flex-1 overflow-y-auto px-2 pb-4"
              data-testid="navbar-mobile-links"
            >
              <MobileToolsMenu groups={mobileMenuGroups} locale={locale} />
            </div>

            <div
              className="flex flex-col items-center gap-4 px-4 pb-1"
              data-testid="navbar-mobile-controls"
            >
              <Link
                className="text-body-emph text-white"
                href={PAGE_LINKS.PDF_TEMPLATES}
                data-testid="navbar-mobile-pdf-templates-link"
              >
                {pdfTemplatesLabel}
              </Link>
              {contactUsNavItem && (
                <Link
                  key={contactUsNavItem.id ?? "contact_us-mobile"}
                  className="text-body-emph text-white"
                  href={navigateThroughURL(
                    contactUsNavItem.url || PAGE_LINKS.CONTACT_US,
                    locale
                  )}
                  onClick={() => trackEvent(EAnalyticsEvents.CONTACT_US_TAP)}
                >
                  {contactUsNavItem.title}
                </Link>
              )}
              {!isLoggedIn && loginLink && (
                <Link
                  variant="unstyled"
                  href={navigateThroughURL(PAGE_LINKS.LOGIN, locale)}
                  className={cn(
                    "text-body-emph flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-white px-4 py-3 text-[color:var(--color-action-main)]",
                    "hover:bg-white/90 hover:text-[color:var(--color-action-main)]"
                  )}
                  onClick={() => trackEvent(EAnalyticsEvents.LOG_IN_TAP)}
                  data-testid="navbar-mobile-login-link"
                >
                  {loginLink.title}
                </Link>
              )}
              {isLoggedIn && (
                <Link
                  href={navigateThroughURL(PAGE_LINKS.DASHBOARD, locale)}
                  className={cn(
                    "text-body-emph bg-primary flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl px-4 py-3 text-black transition-colors duration-200",
                    "hover:opacity-90"
                  )}
                >
                  Dashboard
                </Link>
              )}
              {isLoggedIn && (
                <Button
                  variant="outlined"
                  size="md"
                  onClick={logout}
                  className="w-full border-white bg-white text-[color:var(--color-action-main)] hover:bg-white/90"
                  data-testid="navbar-mobile-log_out-button"
                >
                  {logoutLink?.title ?? auth?.link?.[0]?.title ?? "Logout"}
                </Button>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};
