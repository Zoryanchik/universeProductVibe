import { useMemo, useRef, useState } from "react";

import { cn } from "@/shared/lib/utils/cn";

import type { ITemplateSearchEntry } from "../../model/types";
import { getTemplateUrl } from "../../lib/urls";

interface Props {
  readonly entries: ReadonlyArray<ITemplateSearchEntry>;
  readonly placeholder: string;
  readonly noResultsLabel: string;
  readonly promptTitle: string;
  readonly promptSubtitle: string;
  readonly resultsCountLabel: string;
  readonly className?: string;
}

const MAX_RESULTS = 8;

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className={cn(
      "h-5 w-5 shrink-0 text-[var(--color-text-secondary)]",
      className
    )}
    fill="none"
  >
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path
      d="M20 20l-3.5-3.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const TemplatesSearch: React.FC<Props> = ({
  entries,
  placeholder,
  noResultsLabel,
  promptTitle,
  promptSubtitle,
  resultsCountLabel,
  className,
}) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;

  const results = useMemo(() => {
    if (!hasQuery) return [];

    const q = trimmedQuery.toLowerCase();

    return entries
      .filter(
        (entry) =>
          entry.title.toLowerCase().includes(q) ||
          entry.categoryLabel.toLowerCase().includes(q)
      )
      .slice(0, MAX_RESULTS);
  }, [entries, hasQuery, trimmedQuery]);

  const renderDropdownContent = () => {
    if (!hasQuery) {
      return (
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
          <SearchIcon className="h-8 w-8 text-[var(--color-text-secondary)]" />
          <p className="text-[16px] font-semibold text-[var(--color-text-primary)]">
            {promptTitle}
          </p>
          <p className="text-[14px] text-[var(--color-text-secondary)]">
            {promptSubtitle}
          </p>
        </div>
      );
    }

    if (results.length === 0) {
      return (
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
          <SearchIcon className="h-8 w-8 text-[var(--color-text-secondary)]" />
          <p className="max-w-[320px] text-[14px] text-[var(--color-text-secondary)]">
            {noResultsLabel}
          </p>
        </div>
      );
    }

    return (
      <>
        <p className="px-3 pt-2 pb-1 text-[13px] font-semibold text-[var(--color-text-secondary)]">
          {resultsCountLabel.replace("{{count}}", String(results.length))}
        </p>
        <ul className="flex flex-col">
          {results.map((entry) => (
            <li key={`${entry.categorySlug}/${entry.slug}`}>
              <a
                href={getTemplateUrl(entry.categorySlug, entry.slug)}
                onMouseDown={() => {
                  if (blurTimer.current) clearTimeout(blurTimer.current);
                }}
                className="flex flex-col gap-0.5 rounded-xl px-3 py-2 transition-colors hover:bg-black/5"
              >
                <span className="text-[15px] font-medium text-[var(--color-text-primary)]">
                  {entry.title}
                </span>
                {entry.categoryLabel && (
                  <span className="text-[13px] text-[var(--color-text-secondary)]">
                    {entry.categoryLabel}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </>
    );
  };

  return (
    <div className={cn("relative w-full max-w-[654px] text-start", className)}>
      <div className="flex h-14 items-center gap-3 rounded-full border border-[rgba(0,0,0,0.12)] bg-white px-5 focus-within:border-[var(--color-secondary)]">
        <SearchIcon />
        <input
          type="search"
          value={query}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setOpen(false), 150);
          }}
          className="h-full w-full bg-transparent text-[15px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]"
        />
      </div>

      {open && (
        <div className="absolute start-0 end-0 top-[calc(100%+8px)] z-20 max-h-[360px] overflow-auto rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white p-2 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.24)]">
          {renderDropdownContent()}
        </div>
      )}
    </div>
  );
};
