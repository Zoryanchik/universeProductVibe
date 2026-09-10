import { useState } from "react";

import { ChevronDownIcon } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/utils/cn";

import type { ITemplateCategoryNav } from "../../model/types";
import {
  getCatalogUrl,
  getCategoryUrl,
  getSubcategoryUrl,
} from "../../lib/urls";

interface Props {
  readonly categories: ReadonlyArray<ITemplateCategoryNav>;
  readonly activeCategorySlug?: string;
  readonly activeSubcategorySlug?: string;
  readonly allTemplatesLabel: string;
  readonly navLabel: string;
  readonly expandLabel: string;
  readonly collapseLabel: string;
  readonly className?: string;
}

export const CategorySidebar: React.FC<Props> = ({
  categories,
  activeCategorySlug,
  activeSubcategorySlug,
  allTemplatesLabel,
  navLabel,
  expandLabel,
  collapseLabel,
  className,
}) => {
  const [openSlug, setOpenSlug] = useState<string | null>(
    activeCategorySlug ?? null
  );

  const isAllActive = !activeCategorySlug;

  return (
    <nav
      aria-label={navLabel}
      className={cn(
        "w-[300px] shrink-0 flex-col gap-1 max-md:w-full",
        className
      )}
    >
      <a
        href={getCatalogUrl()}
        className={cn(
          "flex items-center rounded-lg px-3 py-2 text-[15px] font-medium transition-colors",
          isAllActive
            ? "bg-[var(--color-primary)] font-semibold text-[var(--color-primary-contrast-text)]"
            : "text-[var(--color-text-primary)] hover:bg-black/5"
        )}
      >
        {allTemplatesLabel}
      </a>

      {categories.map((category) => {
        const open = openSlug === category.slug;
        const hasSubs = category.subcategories.length > 0;
        const isCategoryActive =
          category.slug === activeCategorySlug && !activeSubcategorySlug;

        return (
          <div key={category.slug} className="flex flex-col">
            <div className="flex items-center">
              <a
                href={getCategoryUrl(category.slug)}
                className={cn(
                  "flex min-w-0 flex-1 items-center rounded-lg px-3 py-2 text-[15px] font-medium transition-colors",
                  isCategoryActive
                    ? "bg-[var(--color-primary)] font-semibold text-[var(--color-primary-contrast-text)]"
                    : "text-[var(--color-text-primary)] hover:bg-black/5"
                )}
              >
                <span className="truncate">{category.title}</span>
              </a>
              {hasSubs && (
                <button
                  type="button"
                  aria-label={open ? collapseLabel : expandLabel}
                  aria-expanded={open}
                  onClick={() => setOpenSlug(open ? null : category.slug)}
                  className="ms-1 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-action-active)] transition-colors hover:bg-black/5"
                >
                  <ChevronDownIcon
                    className={cn(
                      "shrink-0 transition-transform",
                      open ? "rotate-180" : ""
                    )}
                  />
                </button>
              )}
            </div>

            {hasSubs && open && (
              <div className="flex flex-col">
                {category.subcategories.map((sub) => {
                  const isSubActive = sub.slug === activeSubcategorySlug;

                  return (
                    <a
                      key={sub.slug}
                      href={getSubcategoryUrl(category.slug, sub.slug)}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-lg py-2 ps-6 pe-3 text-[14px] transition-colors",
                        isSubActive
                          ? "bg-[var(--color-primary)] font-medium text-[var(--color-primary-contrast-text)]"
                          : "text-[var(--color-text-secondary)] hover:bg-black/5"
                      )}
                    >
                      <span className="truncate">{sub.title}</span>
                      <span className="shrink-0 text-[12px] text-[var(--color-text-secondary)]">
                        {sub.count}
                      </span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};
