import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";
import type { PageType } from "polotno/model/page-model";
import { useCallback, useMemo, useRef, useState, type FC } from "react";

import { cn } from "@/shared/lib/utils/cn";
import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../ui/IconButton";
import { Loader } from "../ui/Loader";
import { useThumbnail } from "../helpers/thumbnail";
import { useLockElements } from "../helpers/lockElements";
import {
  DropdownMenu,
  DIVIDER_VALUE,
  type DropdownMenuOption,
} from "../ui/DropdownMenu";
import { Tooltip } from "../ui/Tooltip";
import { useDeletePage } from "../helpers/deletePage";

const MENU_ACTION_DUPLICATE = "duplicate";
const MENU_ACTION_ADD = "add";
const MENU_ACTION_REMOVE = "remove";

interface PagePreviewProps {
  page: PageType;
  store: StoreType;
  index: number;
  isSelected: boolean;
  onNavigate: (pageId: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

export const PagePreview: FC<PagePreviewProps> = observer(
  ({ page, store, index, isSelected, onNavigate }) => {
    const { t } = useTranslation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [loaderVisible, setLoaderVisible] = useState(true);
    const moreButtonRef = useRef<HTMLDivElement>(null);

    const handleLoaderComplete = useCallback(() => setLoaderVisible(false), []);

    const { thumbnail, containerRef } = useThumbnail(page, store);
    const { handleLock } = useLockElements({ store });
    const { handleDeletePage } = useDeletePage({ store });
    const pageElements = page.children;
    const isPageLocked =
      pageElements.length > 0 &&
      pageElements.every((el: AnyElement) => el.locked);

    const hasManyPages = store.pages.length > 1;

    const menuOptions = useMemo<DropdownMenuOption[]>(() => {
      const options: DropdownMenuOption[] = [
        {
          label: t("templatesEditor.ui.page.duplicate_page") as string,
          value: MENU_ACTION_DUPLICATE,
          iconName: "content_copy",
        },
        {
          label: t("templatesEditor.ui.page.add_page") as string,
          value: MENU_ACTION_ADD,
          iconName: "add",
        },
      ];

      if (hasManyPages) {
        options.push(
          { label: "", value: DIVIDER_VALUE },
          {
            label: t("templatesEditor.ui.page.remove_page") as string,
            value: MENU_ACTION_REMOVE,
            iconName: "delete",
            variant: "danger",
          }
        );
      }

      return options;
    }, [hasManyPages, t]);

    const handleMenuSelect = useCallback(
      (value: string) => {
        switch (value) {
          case MENU_ACTION_DUPLICATE:
            page.clone();
            break;
          case MENU_ACTION_ADD: {
            const pageIndex = store.pages.indexOf(page);
            const newPage = store.addPage({
              width: page.width,
              height: page.height,
              bleed: page.bleed || 0,
            });
            newPage.setZIndex(pageIndex + 1);
            break;
          }
          case MENU_ACTION_REMOVE:
            handleDeletePage(page);
            break;
        }
      },
      [store, page, handleDeletePage]
    );

    const handleAction = () => {
      if (isPageLocked) {
        handleLock(page.children);
      } else {
        setMenuOpen(true);
      }
    };

    return (
      <div
        ref={containerRef}
        className="group relative flex w-[120px] shrink-0 flex-col items-center gap-1"
      >
        <button
          type="button"
          onClick={() => onNavigate(page.id)}
          className={cn(
            "relative h-[162px] w-[120px] shrink-0 cursor-pointer overflow-hidden rounded-[4px] bg-[var(--color-bg-white-bg)] p-0 outline-none",
            isSelected
              ? "border-[3px] border-[var(--color-primary)]"
              : "border border-[#6d7580]"
          )}
        >
          {thumbnail && !loaderVisible && (
            <img
              src={thumbnail}
              alt={
                t("templatesEditor.ui.page.page_alt", {
                  number: index + 1,
                }) as string
              }
              className="pointer-events-none block h-full w-full object-cover"
            />
          )}
          {loaderVisible && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader
                ready={!!thumbnail}
                onComplete={handleLoaderComplete}
                duration={1000}
                size="small"
              />
            </div>
          )}
        </button>
        <div
          ref={moreButtonRef}
          className="absolute top-2 left-1/2 z-[1] -translate-x-1/2 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        >
          <Tooltip
            content={
              isPageLocked
                ? (t("templatesEditor.ui.page.unlock_page") as string)
                : (t("templatesEditor.ui.page.page_menu") as string)
            }
            placement="top"
            offset={15}
          >
            <IconButton
              iconName={isPageLocked ? "lock" : "more_horiz"}
              active={menuOpen}
              onClick={handleAction}
            />
          </Tooltip>
          <DropdownMenu
            options={menuOptions}
            isOpen={menuOpen}
            onSelect={handleMenuSelect}
            onClose={() => setMenuOpen(false)}
            anchorRef={moreButtonRef}
            placement="top"
            minWidth={200}
            size="large"
          />
        </div>
        <div
          className={cn(
            "flex min-w-[53px] shrink-0 items-center justify-center rounded-[4px] p-1",
            isSelected ? "bg-[var(--color-primary)]" : "bg-[#6d7580]"
          )}
        >
          <span className="text-center font-[Outfit,sans-serif] text-[14px] leading-[18px] font-semibold text-white">
            {index + 1}
          </span>
        </div>
      </div>
    );
  }
);
