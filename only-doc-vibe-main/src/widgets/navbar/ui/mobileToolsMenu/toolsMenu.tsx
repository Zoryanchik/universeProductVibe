import { useMemo, useState, type FC } from "react";
import { cn } from "@universe-forma/ui-pes";
import { ReactComponent as RightIcon } from "@public/assets/header/right-icon.svg?react";

import type { ELanguages } from "@/shared/constants/languages";
import { navigateThroughURL } from "@/shared/lib/seo/navigate-through-url";

import type { INavbarDropdownGroup } from "../../model/types";

interface IMobileToolsMenuProps {
  readonly groups?: INavbarDropdownGroup[];
  readonly locale: ELanguages;
}

export const MobileToolsMenu: FC<IMobileToolsMenuProps> = ({
  groups = [],
  locale,
}) => {
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  const resolvedGroups = useMemo<INavbarDropdownGroup[]>(
    () => groups,
    [groups]
  );

  const activeGroup = resolvedGroups.find(
    (group) => group.id === activeGroupId
  );

  if (!resolvedGroups.length) return null;

  if (!activeGroup) {
    return (
      <div className="flex w-full flex-col items-start gap-3">
        {resolvedGroups.map((group) => (
          <button
            key={group.id}
            onClick={() => setActiveGroupId(group.id)}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-white transition-colors",
              "hover:bg-[var(--color-white-12)]"
            )}
          >
            <span className="text-subtitle-emph tracking-normal normal-case">
              {group.title}
            </span>
            {group.items.length > 0 && <RightIcon className="size-4" />}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-start gap-3">
      <button
        onClick={() => setActiveGroupId(null)}
        className="flex cursor-pointer items-center gap-2 text-white"
      >
        <RightIcon className="size-6 rotate-90" />
        <span className="text-caption font-medium uppercase">
          {activeGroup.title}
        </span>
      </button>

      <div className="w-full rounded-xl bg-[var(--color-white-12)] px-2 py-3 backdrop-blur-[30px]">
        <div className="text-body px-4 text-white">{activeGroup.title}</div>
        <div className="mx-4 pt-2 pb-1">
          <div className="h-px bg-[var(--color-white-24)]" />
        </div>
        <div className="flex flex-col gap-0.5">
          {activeGroup.items.map((item) => (
            <a
              key={item.id}
              href={navigateThroughURL(item.url, locale)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-4 py-2 text-start text-white no-underline transition-colors",
                "hover:bg-[var(--color-white-12)]",
                {
                  "rounded-xl bg-[var(--color-white-12)]": Boolean(
                    item.badge?.label
                  ),
                }
              )}
              data-testid={`navbar-mobile-${item.url.replace(/^\//, "")}-link`}
            >
              {item.iconUrl && (
                <img
                  className="size-8 shrink-0 object-contain"
                  src={item.iconUrl}
                  alt={item.iconAlt ?? item.title}
                />
              )}
              <span className="text-body flex-1 font-medium">{item.title}</span>
              {item.badge?.label && (
                <span className="rounded-lg border-2 border-white bg-[var(--color-primary)] px-2 py-0.5 text-sm font-medium text-[var(--color-action-main)]">
                  {item.badge.label}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
