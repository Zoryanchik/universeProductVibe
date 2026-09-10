import { useEffect, useState, type FC } from "react";
import { BaseDropdown, cn } from "@universe-forma/ui-pes";
import checkIcon from "@public/assets/header/lang-check-icon.svg?url";
import { ReactComponent as LanguageIcon } from "@public/assets/header/lang-icon.svg?react";
import { ReactComponent as RightIcon } from "@public/assets/header/right-icon.svg?react";

import type { ELanguages } from "@/shared/constants/languages";
import { LANGUAGES_LABELS } from "@/shared/constants/languages";
import { availableLocales } from "@/shared/config/locale";
import { EAnalyticsEvents, trackEvent } from "@/shared/lib/analytics";
import { getLocaleSwitchHref } from "@/shared/lib/navigation/getLocaleSwitchHref";
import { getPathWithoutLocale } from "@/shared/lib/navigation/getPathWithoutLocale";
import { localeNavigate } from "@/shared/lib/navigation/localeNavigate";

import { LANGUAGES_FLAGS_MAP } from "../../model/constants";

interface IHeaderDropdownMenuProps {
  isMobile?: boolean;
  isHeaderDark?: boolean;
  currentLang: ELanguages;
  availableLanguages?: ELanguages[];
  pathname: string;
  pageLocalizations?: ELanguages[];
}

export const LanguageMenu: FC<IHeaderDropdownMenuProps> = ({
  isMobile = false,
  isHeaderDark = false,
  currentLang,
  availableLanguages,
  pathname,
  pageLocalizations,
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const filteredLanguages = (availableLanguages ?? availableLocales).filter(
    (lang) => availableLocales.includes(lang)
  );

  const isLocaleSupportedByPage = (lang: ELanguages): boolean =>
    !pageLocalizations || pageLocalizations.includes(lang);

  const onItemClick = (lang: ELanguages): void => {
    trackEvent(EAnalyticsEvents.CHANGE_LANGUAGE_TAP, { type: lang });

    if (currentLang === lang) return;

    setPopoverOpen(false);

    if (!isLocaleSupportedByPage(lang)) {
      localeNavigate("/", lang);

      return;
    }

    const currentPath = getPathWithoutLocale(
      window.location.pathname,
      currentLang
    );
    localeNavigate(currentPath, lang);
  };

  useEffect(() => {
    if (popoverOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("no-scroll");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("no-scroll");
    }

    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("no-scroll");
    };
  }, [popoverOpen]);

  return (
    <>
      {/*
        Crawler-visible language links. The visible dropdown below is a Radix
        popover whose contents only mount when opened — so search engines (and
        non-JS crawlers) never see the <a> tags inside it. This sr-only <nav>
        guarantees one DOM-present anchor per locale in the SSR HTML, mirroring
        the dropdown's hrefs (including the missing-translation fallback).
      */}
      <nav className="sr-only" aria-label="Language options">
        {filteredLanguages?.map((lang) => (
          <a
            key={lang}
            href={getLocaleSwitchHref(
              pathname,
              currentLang,
              lang,
              pageLocalizations
            )}
          >
            {LANGUAGES_LABELS[lang]}
          </a>
        ))}
      </nav>
      <BaseDropdown
        modal={false}
        open={popoverOpen}
        side="bottom"
        align={isMobile ? "center" : "start"}
        onOpenChange={(open) => {
          if (open) trackEvent(EAnalyticsEvents.LANDING_LANGUAGE_TAP);

          setPopoverOpen(open);
        }}
        className="flex max-h-[180px] w-[220px] flex-col items-start gap-0.5 rounded-2xl bg-white p-2 shadow-[0_6px_12px_-2px_rgba(0,0,0,0.08),0_8px_40px_0_rgba(0,0,0,0.08)]"
        trigger={
          <button
            type="button"
            className={cn(
              "text-body-emph flex cursor-pointer items-center justify-center gap-2 rounded-lg p-2 transition-colors duration-200",
              "hover:bg-state-primary-hover hover:text-primary-dark hover:[&_svg]:first:fill-primary-dark hover:[&_.lang-divider]:bg-primary-dark hover:[&_.lang-divider]:opacity-100",
              {
                "text-primary-dark bg-state-primary-hover [&_.lang-divider]:bg-primary-dark [&_.lang-divider]:opacity-100 [&_svg]:last:rotate-180":
                  popoverOpen || isMobile,
              },
              {
                "text-white hover:bg-white/12 hover:text-white hover:[&_.lang-divider]:bg-white hover:[&_svg]:first:fill-white":
                  isHeaderDark,
              },
              {
                "bg-white/12 text-white [&_.lang-divider]:bg-white [&_.lang-divider]:opacity-40":
                  isHeaderDark && popoverOpen,
              },
              {
                "[&_svg]:last:rotate-360": popoverOpen && isMobile,
              },
              {
                "border-primary-opacity-50 text-primary [&_.lang-divider]:bg-primary [&_svg]:fill-primary flex min-h-12 flex-1 items-center justify-center rounded-xl border bg-white [&_.lang-divider]:opacity-100":
                  isMobile,
              }
            )}
          >
            <LanguageIcon />
            <span className="max-lg:hidden max-md:block">
              {LANGUAGES_LABELS[currentLang]}
            </span>

            {(!isHeaderDark || isMobile) && (
              <span
                className={cn(
                  "lang-divider bg-text-primary h-6 w-px opacity-40 max-lg:hidden max-md:block",
                  {
                    "bg-primary-opacity-50!": isMobile,
                  }
                )}
              />
            )}

            <RightIcon className="size-4 max-lg:hidden max-md:block" />
          </button>
        }
      >
        {filteredLanguages &&
          filteredLanguages.map((lang) => (
            <a
              key={lang}
              href={getLocaleSwitchHref(
                pathname,
                currentLang,
                lang,
                pageLocalizations
              )}
              onClick={(e) => {
                e.preventDefault();
                onItemClick(lang);
              }}
              className={cn(
                "hover:bg-state-primary-hover hover:text-primary-dark flex min-h-10 cursor-pointer items-center gap-2 self-stretch rounded-xl p-2",
                {
                  "bg-state-primary-hover text-primary-dark":
                    currentLang === lang,
                }
              )}
            >
              <div className="flex size-5 items-center justify-center">
                <img src={LANGUAGES_FLAGS_MAP[lang]?.flag || ""} />
              </div>
              <div className="flex flex-1 items-start">
                <span className="text-body text-text-primary line-clamp-2 self-stretch overflow-hidden text-ellipsis">
                  {LANGUAGES_LABELS[lang]}
                </span>
              </div>
              {currentLang === lang && (
                <div className="flex size-5.5 items-center">
                  <img src={checkIcon} />
                </div>
              )}
            </a>
          ))}
      </BaseDropdown>
    </>
  );
};
