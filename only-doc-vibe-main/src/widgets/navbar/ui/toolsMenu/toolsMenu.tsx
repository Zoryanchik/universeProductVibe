import { useState, type FC } from "react";
import { BaseDropdown, cn } from "@universe-forma/ui-pes";
import { ReactComponent as RightIcon } from "@public/assets/header/right-icon.svg?react";

import type { ELanguages } from "@/shared/constants/languages";
import { Image } from "@/shared/ui/image";
import {
  EAnalyticsEvents,
  normalizeFeatureName,
  trackEvent,
} from "@/shared/lib/analytics";
import { navigateThroughURL } from "@/shared/lib/seo/navigate-through-url";

import { DropdownGroup } from "./dropdownGroup";
import type { INavbarDropdownGroup, INavbarItem } from "../../model/types";

interface IHeaderDropdownMenuProps {
  readonly item: INavbarItem;
  readonly groups?: INavbarDropdownGroup[];
  readonly locale: ELanguages;
}

export const ToolsMenu: FC<IHeaderDropdownMenuProps> = ({
  item,
  groups = [],
  locale,
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const fireOpenEvents = () => {
    if (popoverOpen) return;

    trackEvent(EAnalyticsEvents.TOOLS_TAP);
    trackEvent(EAnalyticsEvents.CONVERT_PAGE_TAP);
    if (item.link_id !== "all_tools") {
      trackEvent(EAnalyticsEvents.CONVERSION_TOOLS_PAGE_VIEW);
    }
  };

  return (
    <BaseDropdown
      modal={false}
      open={popoverOpen}
      onOpenChange={(open) => {
        if (open) fireOpenEvents();

        setPopoverOpen(open);
      }}
      className="flex max-h-[calc(100vh-120px)] w-[1140px] max-w-[calc(100vw-32px)] items-stretch gap-2 max-xl:w-[960px] max-lg:w-[860px]"
      trigger={
        <button
          key={item.id}
          type="button"
          onClick={fireOpenEvents}
          className={cn(
            "text-body-emph flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 font-bold text-white transition-colors duration-200",
            "hover:bg-white/12 hover:text-white",
            {
              "bg-white/12 text-[var(--color-primary)] [&_svg]:last:rotate-180 [&_svg]:last:text-[var(--color-primary)]":
                popoverOpen,
            }
          )}
        >
          {item.title}

          <RightIcon className="size-4" />
        </button>
      }
    >
      <style>
        {`
          [data-radix-popper-content-wrapper] {
            transform: none !important;
            left: 0 !important;
            top: 106px !important;
            width: 100vw !important;
            display: flex !important;
            justify-content: center !important;
          }
          .navbar-scroll {
            scrollbar-width: thin;
            scrollbar-color: transparent transparent;
          }
          .navbar-scroll:hover {
            scrollbar-color: rgba(255,255,255,0.2) transparent;
          }
          .navbar-scroll::-webkit-scrollbar {
            width: 4px;
          }
          .navbar-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .navbar-scroll::-webkit-scrollbar-thumb {
            background: transparent;
            border-radius: 4px;
          }
          .navbar-scroll:hover::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.2);
          }
        `}
      </style>
      {groups.map((group) => (
        <DropdownGroup key={group.id} title={group.title}>
          {group.items.map((menuItem) => (
            <a
              key={menuItem.id}
              href={
                menuItem.url ? navigateThroughURL(menuItem.url, locale) : "/"
              }
              onClick={() => {
                setPopoverOpen(false);
                trackEvent(EAnalyticsEvents.LANDING_FEATURES_TAP, {
                  feature_name: normalizeFeatureName(menuItem.title),
                });
              }}
              className={cn(
                "flex items-center gap-3 self-stretch rounded-lg px-4 py-2 text-white transition-colors duration-200",
                "hover:bg-white/10"
              )}
            >
              {menuItem.iconUrl && (
                <Image
                  className="size-8 shrink-0 object-contain"
                  src={menuItem.iconUrl}
                  alt={menuItem.iconAlt ?? menuItem.title}
                />
              )}
              <span className="text-body-emph flex-1 truncate">
                {menuItem.title}
              </span>
              {menuItem.badge?.label && (
                <span className="shrink-0 rounded-[6px] border-2 border-white bg-[var(--color-action-main,#1f5de2)] px-1.5 py-0.5 text-sm leading-5 font-medium text-white">
                  {menuItem.badge.label}
                </span>
              )}
            </a>
          ))}
        </DropdownGroup>
      ))}
    </BaseDropdown>
  );
};
