import { useState, useRef, useEffect, type FC } from "react";
import { cn } from "@universe-forma/ui-pes";

import type { ELanguages } from "@/shared/constants/languages";

import {
  getFlagUrl,
  type ITranslateLanguage,
} from "../../model/constants/translate-languages";

interface Props {
  label?: string;
  hint?: string;
  value: ELanguages | null;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  languages: ITranslateLanguage[];
  onSelect: (code: ELanguages) => void;
  testId?: string;
}

const resolveFlagUrl = (lang: ITranslateLanguage): string =>
  lang.flagImageUrl ?? getFlagUrl(lang.flagCode);

export const LanguageDropdown: FC<Props> = ({
  label,
  hint,
  value,
  placeholder,
  searchPlaceholder,
  noResultsText,
  languages,
  onSelect,
  testId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedLang = value
    ? (languages.find((l) => l.code === value) ?? null)
    : null;

  const filteredLanguages = search
    ? languages.filter((lang) =>
        lang.label.toLowerCase().includes(search.toLowerCase())
      )
    : languages;

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (lang: ITranslateLanguage) => {
    onSelect(lang.code);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className="flex flex-col" data-testid={testId}>
      {/* Label */}
      <span className="pb-1 text-[13px] leading-[14px] font-light text-black/60">
        {label}
      </span>

      {/* Trigger + Dropdown wrapper - dropdown is positioned relative to this */}
      <div className="relative">
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "flex w-full cursor-pointer items-center gap-2 rounded-xl border px-3 py-3.5 text-start transition-colors",
            isOpen
              ? "border-primary"
              : "border-black/[0.14] hover:border-black/30"
          )}
        >
          {selectedLang ? (
            <>
              <img
                src={resolveFlagUrl(selectedLang)}
                alt=""
                className="size-6 shrink-0 rounded-sm object-cover"
              />
              <span className="flex-1 text-base leading-6 font-light text-black/[0.87]">
                {selectedLang.label}
              </span>
            </>
          ) : (
            <>
              <svg
                className="size-5 shrink-0 text-black/40"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0Zm6.918 6h-2.95a15.65 15.65 0 0 0-1.382-3.556A8.03 8.03 0 0 1 16.918 6ZM10 2.04c.658.89 1.21 1.87 1.634 2.96H8.366A13.59 13.59 0 0 1 10 2.04ZM2.26 12a7.8 7.8 0 0 1 0-4h3.38a15.6 15.6 0 0 0 0 4H2.26Zm.822 2h2.95a15.65 15.65 0 0 0 1.382 3.556A8.03 8.03 0 0 1 3.082 14Zm2.95-8H3.082a8.03 8.03 0 0 1 4.332-3.556A15.65 15.65 0 0 0 6.032 6ZM10 17.96A13.59 13.59 0 0 1 8.366 15h3.268A13.59 13.59 0 0 1 10 17.96ZM11.97 12H8.03a13.87 13.87 0 0 1 0-4h3.94a13.87 13.87 0 0 1 0 4Zm.616 5.556A15.65 15.65 0 0 0 13.968 14h2.95a8.03 8.03 0 0 1-4.332 3.556ZM14.36 12a15.6 15.6 0 0 0 0-4h3.38a7.8 7.8 0 0 1 0 4h-3.38Z"
                  fill="currentColor"
                />
              </svg>
              <span className="flex-1 text-base leading-6 font-light text-black/40">
                {placeholder}
              </span>
            </>
          )}
          <svg
            className={cn(
              "size-5 shrink-0 text-black/40 transition-transform",
              isOpen && "rotate-180"
            )}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.59 7.41 10 11.83l4.41-4.42L16 8.83l-6 6-6-6 1.59-1.42Z"
              fill="currentColor"
            />
          </svg>
        </button>

        {/* Dropdown list - positioned directly below the trigger */}
        {isOpen && (
          <div className="absolute top-full z-50 flex w-full flex-col rounded-xl border border-black/[0.08] bg-white shadow-lg">
            {/* Search input */}
            <div className="flex items-center gap-2 border-b border-black/[0.08] px-3 py-2.5">
              <svg
                className="size-5 shrink-0 text-black/40"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0Zm6.918 6h-2.95a15.65 15.65 0 0 0-1.382-3.556A8.03 8.03 0 0 1 16.918 6ZM10 2.04c.658.89 1.21 1.87 1.634 2.96H8.366A13.59 13.59 0 0 1 10 2.04ZM2.26 12a7.8 7.8 0 0 1 0-4h3.38a15.6 15.6 0 0 0 0 4H2.26Zm.822 2h2.95a15.65 15.65 0 0 0 1.382 3.556A8.03 8.03 0 0 1 3.082 14Zm2.95-8H3.082a8.03 8.03 0 0 1 4.332-3.556A15.65 15.65 0 0 0 6.032 6ZM10 17.96A13.59 13.59 0 0 1 8.366 15h3.268A13.59 13.59 0 0 1 10 17.96ZM11.97 12H8.03a13.87 13.87 0 0 1 0-4h3.94a13.87 13.87 0 0 1 0 4Zm.616 5.556A15.65 15.65 0 0 0 13.968 14h2.95a8.03 8.03 0 0 1-4.332 3.556ZM14.36 12a15.6 15.6 0 0 0 0-4h3.38a7.8 7.8 0 0 1 0 4h-3.38Z"
                  fill="currentColor"
                />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="flex-1 text-sm leading-5 text-black/[0.87] outline-none placeholder:text-black/40"
              />
            </div>

            {/* Language list */}
            <div className="max-h-[200px] overflow-y-auto py-1">
              {filteredLanguages.length === 0 ? (
                <div className="px-3 py-2 text-sm text-black/40">
                  {noResultsText}
                </div>
              ) : (
                filteredLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelect(lang)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-start transition-colors",
                      lang.code === value
                        ? "bg-primary-opacity-8 text-primary font-medium"
                        : "hover:bg-black/[0.04]"
                    )}
                  >
                    <img
                      src={resolveFlagUrl(lang)}
                      alt=""
                      className="size-5 shrink-0 rounded-sm object-cover"
                    />
                    <span className="text-sm leading-5">{lang.label}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hint text - outside the relative wrapper so dropdown overlaps it */}
      {hint && (
        <span className="min-h-5 px-3 pt-1 pb-0.5 text-[13px] leading-4 font-normal text-black/60">
          {hint}
        </span>
      )}
    </div>
  );
};
