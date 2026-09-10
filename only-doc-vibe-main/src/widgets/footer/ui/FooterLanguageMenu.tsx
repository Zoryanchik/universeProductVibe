import { useState, type FC } from "react";
import { BaseDropdown, cn } from "@universe-forma/ui-pes";
import englishFlagIcon from "@public/assets/flags/english.svg?url";
import frenchFlagIcon from "@public/assets/flags/french.svg?url";
import indonesianFlagIcon from "@public/assets/flags/indonesian.svg?url";
import portugueseFlagIcon from "@public/assets/flags/portuguese.svg?url";
import spanishFlagIcon from "@public/assets/flags/spanish.svg?url";
import footerDivider from "@public/assets/footer/divider.svg?url";
import checkGlyphIcon from "@public/assets/header/lang-check-icon.svg?url";
import { ReactComponent as LanguageIcon } from "@public/assets/header/lang-icon.svg?react";
import { ReactComponent as RightIcon } from "@public/assets/header/right-icon.svg?react";

import { ELanguages, LANGUAGES_LABELS } from "@/shared/constants/languages";
import type { ELanguages as TLanguage } from "@/shared/constants/languages";
import { availableLocales } from "@/shared/config/locale";
import { EAnalyticsEvents, trackEvent } from "@/shared/lib/analytics";
import { getLocaleSwitchHref } from "@/shared/lib/navigation/getLocaleSwitchHref";
import { getPathWithoutLocale } from "@/shared/lib/navigation/getPathWithoutLocale";
import { localeNavigate } from "@/shared/lib/navigation/localeNavigate";

interface FooterLanguageMenuProps {
  readonly currentLang: TLanguage;
  readonly path: string;
  readonly availableLanguages: TLanguage[];
  readonly pageLocalizations?: TLanguage[];
}

const FLAGS_BY_LANGUAGE: Partial<Record<TLanguage, string>> = {
  [ELanguages.ENGLISH]: englishFlagIcon,
  [ELanguages.FRENCH]: frenchFlagIcon,
  [ELanguages.GERMAN]: englishFlagIcon,
  [ELanguages.PORTUGUESE]: portugueseFlagIcon,
  [ELanguages.SPANISH]: spanishFlagIcon,
  [ELanguages.INDONESIAN]: indonesianFlagIcon,
};

export const FooterLanguageMenu: FC<FooterLanguageMenuProps> = ({
  currentLang,
  path,
  availableLanguages,
  pageLocalizations,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // Only surface site-supported locales. CMS footer translations may include
  // languages the site doesn't route, which would 404.
  const languages = (
    availableLanguages.length ? availableLanguages : availableLocales
  ).filter((lang) => availableLocales.includes(lang));

  const isLocaleSupportedByPage = (lang: TLanguage): boolean =>
    !pageLocalizations || pageLocalizations.includes(lang);

  const onChangeLanguage = (lang: TLanguage): void => {
    trackEvent(EAnalyticsEvents.CHANGE_LANGUAGE_TAP, { type: lang });

    if (lang === currentLang) {
      setIsOpen(false);

      return;
    }

    if (!isLocaleSupportedByPage(lang)) {
      localeNavigate("/", lang);

      return;
    }

    const routePath = getPathWithoutLocale(path, currentLang);
    localeNavigate(routePath, lang);
  };

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
        {languages.map((lang) => (
          <a
            key={lang}
            href={getLocaleSwitchHref(
              path,
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
        open={isOpen}
        onOpenChange={(open) => {
          if (open) trackEvent(EAnalyticsEvents.LANDING_LANGUAGE_TAP);

          setIsOpen(open);
        }}
        align="end"
        side="bottom"
        className="flex w-[220px] flex-col gap-0.5 rounded-2xl bg-[var(--color-white-12)] p-2 shadow-[0_6px_12px_0_rgba(0,0,0,0.08),0_8px_40px_0_rgba(0,0,0,0.08)] backdrop-blur-[30px]"
        trigger={
          <button
            className="flex cursor-pointer items-center rounded-xl text-white transition-colors hover:bg-[var(--color-white-12)]"
            aria-label="Switch language"
          >
            <span className="flex items-center gap-2 py-3 pe-3">
              <LanguageIcon className="size-6 fill-white" />
              <span className="text-button-md">
                {LANGUAGES_LABELS[currentLang]}
              </span>
            </span>
            <span className="flex self-stretch py-3">
              <img src={footerDivider} alt="" aria-hidden className="h-full" />
            </span>
            <span className="flex items-center justify-center p-3">
              <RightIcon className={cn("size-6", { "rotate-180": isOpen })} />
            </span>
          </button>
        }
      >
        {languages.map((lang) => (
          <a
            key={lang}
            href={getLocaleSwitchHref(
              path,
              currentLang,
              lang,
              pageLocalizations
            )}
            onClick={(e) => {
              e.preventDefault();
              onChangeLanguage(lang);
            }}
            className={cn(
              "flex min-h-10 cursor-pointer items-center gap-2 self-stretch rounded-xl px-2 py-2 text-start text-white transition-colors",
              "hover:bg-[var(--color-white-12)]",
              {
                "bg-[var(--color-white-12)] text-[var(--color-primary)]":
                  currentLang === lang,
              }
            )}
          >
            <img
              className="size-6 object-cover"
              src={FLAGS_BY_LANGUAGE[lang] ?? englishFlagIcon}
              alt={`${LANGUAGES_LABELS[lang]} flag`}
            />
            <span className="text-body flex-1">{LANGUAGES_LABELS[lang]}</span>
            {currentLang === lang && (
              <img className="size-4" src={checkGlyphIcon} alt="" aria-hidden />
            )}
          </a>
        ))}
      </BaseDropdown>
    </>
  );
};
