import type { JSX } from "react";

import { cn } from "@/shared/lib/utils/cn";

export interface CategoryTab {
  readonly slug: string | null;
  readonly label: string;
  readonly href: string;
  readonly isActive: boolean;
}

interface CategoryTabsProps {
  readonly tabs: ReadonlyArray<CategoryTab>;
  readonly className?: string;
}

export const CategoryTabs = ({
  tabs,
  className,
}: CategoryTabsProps): JSX.Element => {
  return (
    <nav
      aria-label="Blog categories"
      className={cn(
        "scrollbar-none -mx-4 flex w-screen overflow-x-auto px-4 md:hidden",
        className
      )}
    >
      <ul className="flex min-w-full items-center gap-1 rounded-[12px]">
        {tabs.map((tab) => (
          <li key={tab.slug ?? "all"} className="shrink-0">
            <a
              href={tab.href}
              aria-current={tab.isActive ? "page" : undefined}
              className={cn(
                "inline-flex items-center justify-center rounded-[10px] px-2 py-[7px] text-[14px] leading-[20px] font-medium whitespace-nowrap transition-colors",
                tab.isActive
                  ? "bg-[var(--color-blog-cta-bg)] text-[var(--color-blog-category-active)]"
                  : "text-[var(--color-text-primary)] hover:bg-[var(--color-action-8)]"
              )}
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
