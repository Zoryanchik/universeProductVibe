import { useEffect, useState, type JSX } from "react";

import { cn } from "@/shared/lib/utils/cn";
import type { ITocItem } from "@/shared/lib/blog/extract-toc";

interface TableOfContentsProps {
  readonly items: ReadonlyArray<ITocItem>;
  readonly title: string;
  readonly className?: string;
}

export const TableOfContents = ({
  items,
  title,
  className,
}: TableOfContentsProps): JSX.Element | null => {
  const [activeId, setActiveId] = useState<string | undefined>(items[0]?.id);

  useEffect(() => {
    if (items.length === 0 || typeof window === "undefined") return;

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0, 1] }
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <aside
      className={cn("flex w-full max-w-[177px] flex-col gap-6", className)}
    >
      <p className="text-[13px] leading-[16px] font-medium text-[var(--color-text-secondary)] uppercase">
        {title}
      </p>
      <nav>
        <ul className="flex flex-col gap-2">
          {items.map((item) => {
            const isActive = item.id === activeId;

            return (
              <li key={item.id} className={cn(item.level === 3 && "ps-3")}>
                <a
                  href={`#${item.id}`}
                  className={cn(
                    "block text-[14px] leading-[18px] transition-colors",
                    isActive
                      ? "text-[var(--color-blog-category-active)]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  )}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
