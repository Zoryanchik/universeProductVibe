import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState, type FC } from "react";
import type { ReactNode } from "react";
import { cn } from "@universe-forma/ui-pes";

import { EModalsTypes } from "@/shared/constants/modals-keys";
import { openModal } from "@/shared/lib/modals/modals-store";
import { useTranslation } from "@/shared/lib/translations";
import { getFIleTypeFromFilename } from "@/shared/lib/documents/getFileTypeFromFilename";
import {
  FORMATS_DICTIONARY,
  DEFAULT_FORMATS_DICTIONARY,
} from "@/shared/ui/choose-format-modal/model/constants";
import {
  ChevronRightIcon,
  CompressIcon,
  ConvertIcon,
  AppsIcon,
  CopyIcon,
  MailIcon,
  MoreHorizontalIcon,
  PrintIcon,
  RenameIcon,
  ShareIcon,
  StarIcon,
  TrashIcon,
  TranslateIcon,
} from "@/shared/ui/dashboard-icons";

import type { IUserFile } from "@/entities/documents";
import {
  FORMAT_GROUP_BADGE_ICON,
  getFormatGroupForType,
} from "@/entities/documents";

import {
  useDashboardActions,
  useDashboardToolActions,
} from "@/features/dashboard-actions";

interface RowActionsProps {
  file: IUserFile;
  className?: string;
}

interface MenuPos {
  top: number;
  right: number;
}

const MENU_WIDTH = 224;
const TOOLS_MENU_HEIGHT = 240;
const MAIN_MENU_HEIGHT = 360;
const MENU_OFFSET = 4;
const VIEWPORT_PADDING = 8;
const MOBILE_BREAKPOINT = 768;

/** Calculate a `top` value that keeps the menu fully within the viewport. */
const calcMenuTop = (rect: DOMRect, menuHeight: number): number => {
  const preferred = rect.bottom + MENU_OFFSET;
  const maxTop = window.innerHeight - menuHeight - VIEWPORT_PADDING;

  return Math.max(VIEWPORT_PADDING, Math.min(preferred, maxTop));
};

const FORMAT_LABEL_MAP: Record<string, string> = {
  PDF: "PDF",
  DOCX: "Word (.docx)",
  DOC: "Word (.doc)",
  XLSX: "Excel (.xlsx)",
  XLS: "Excel (.xls)",
  CSV: "CSV (.csv)",
  JPG: "Image (.jpg)",
  PNG: "Image (.png)",
  TIFF: "Image (.tiff)",
  PPTX: "Presentation (.pptx)",
  PPT: "Presentation (.ppt)",
  AZW3: "E-book (.azw3)",
  EPUB: "E-book (.epub)",
  RTF: "RTF (.rtf)",
  ODT: "ODT (.odt)",
  TXT: "Text (.txt)",
  TEXT: "Text (.txt)",
};

export const RowActions: FC<RowActionsProps> = ({ file, className }) => {
  const { t } = useTranslation();
  const { duplicate, print } = useDashboardActions();
  const { handleConvertTo, handleCompress, handleTranslate } =
    useDashboardToolActions();

  const convertFormatItems = useMemo(() => {
    const fileType = getFIleTypeFromFilename(file.filename);
    const available =
      (fileType ? FORMATS_DICTIONARY[fileType] : null) ??
      DEFAULT_FORMATS_DICTIONARY;

    return available.map(
      (opt: { to: string; label: string; format: string }) => {
        const group = getFormatGroupForType(opt.to);
        const badge =
          FORMAT_GROUP_BADGE_ICON[group] ?? FORMAT_GROUP_BADGE_ICON.PDF;
        const label =
          FORMAT_LABEL_MAP[opt.to] ?? `${opt.label} (${opt.format})`;

        return { label, badge, format: opt.to };
      }
    );
  }, [file.filename]);

  const [openMenu, setOpenMenu] = useState<"tools" | "main" | null>(null);
  const [showConvertSub, setShowConvertSub] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [toolsPos, setToolsPos] = useState<MenuPos | null>(null);
  const [mainPos, setMainPos] = useState<MenuPos | null>(null);
  const [convertSubPos, setConvertSubPos] = useState<MenuPos | null>(null);

  const toolsBtnRef = useRef<HTMLButtonElement>(null);
  const mainBtnRef = useRef<HTMLButtonElement>(null);
  const convertItemRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpenMenu(null);
    setShowConvertSub(false);
  };

  useEffect(() => {
    if (!openMenu) return;

    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      const inTools = document.getElementById("tools-menu-portal")?.contains(t);
      const inMain = document.getElementById("main-menu-portal")?.contains(t);
      const inConvert = document
        .getElementById("convert-sub-portal")
        ?.contains(t);
      const inMobile = document
        .getElementById("mobile-menu-portal")
        ?.contains(t);
      if (!inTools && !inMain && !inConvert && !inMobile) close();
    };
    const onScroll = () => close();
    document.addEventListener("mousedown", onDown);
    if (!isMobile) window.addEventListener("scroll", onScroll, true);

    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [openMenu, isMobile]);

  const openToolsMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (openMenu === "tools") {
      close();

      return;
    }

    const mobile = window.innerWidth < MOBILE_BREAKPOINT;
    setIsMobile(mobile);

    const rect = toolsBtnRef.current!.getBoundingClientRect();
    setToolsPos({
      top: calcMenuTop(rect, TOOLS_MENU_HEIGHT),
      right: window.innerWidth - rect.right,
    });
    setOpenMenu("tools");
    setShowConvertSub(false);
  };

  const openMainMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (openMenu === "main") {
      close();

      return;
    }

    const mobile = window.innerWidth < MOBILE_BREAKPOINT;
    setIsMobile(mobile);

    const rect = mainBtnRef.current!.getBoundingClientRect();
    setMainPos({
      top: calcMenuTop(rect, MAIN_MENU_HEIGHT),
      right: window.innerWidth - rect.right,
    });
    setOpenMenu("main");
    setShowConvertSub(false);
  };

  const handleConvertHover = () => {
    if (!convertItemRef.current || !toolsPos) return;

    const rect = convertItemRef.current.getBoundingClientRect();
    setConvertSubPos({
      top: toolsPos.top,
      right: window.innerWidth - rect.left + MENU_OFFSET,
    });
    setShowConvertSub(true);
  };

  const handleConvertActivate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMobile) {
      setShowConvertSub(true);

      return;
    }

    handleConvertHover();
  };

  const menuItemCls =
    "flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-start text-base transition-colors hover:bg-[var(--color-state-primary-hover)]";

  type MenuItem =
    | {
        type: "action";
        key: string;
        label: unknown;
        icon: ReactNode;
        onClick: () => void;
        destructive?: boolean;
      }
    | { type: "divider"; key: string };

  const mainMenuItems: MenuItem[] = [
    // TODO: uncomment Edit when the feature is ready
    // {
    //   type: "action",
    //   key: "edit",
    //   label: t("dashboard.actions.edit"),
    //   icon: <EditIcon size={18} />,
    //   onClick: () => {},
    // },
    {
      type: "action",
      key: "duplicate",
      label: t("dashboard.actions.duplicate"),
      icon: <CopyIcon size={18} />,
      onClick: () => {
        void duplicate(file.id);
      },
    },
    {
      type: "action",
      key: "rename",
      label: t("dashboard.actions.rename"),
      icon: <RenameIcon size={18} />,
      onClick: () =>
        openModal({
          type: EModalsTypes.DASHBOARD_RENAME_FILE,
          options: { fileId: file.id, filename: file.filename },
        }),
    },
    { type: "divider", key: "div-1" },
    {
      type: "action",
      key: "print",
      label: t("dashboard.actions.print"),
      icon: <PrintIcon size={18} />,
      onClick: () => {
        void print(file);
      },
    },
    {
      type: "action",
      key: "shareLink",
      label: t("dashboard.actions.shareLink"),
      icon: <ShareIcon size={18} />,
      onClick: () =>
        openModal({
          type: EModalsTypes.DASHBOARD_SHARE_LINK,
          options: { fileId: file.id, filename: file.filename },
        }),
    },
    {
      type: "action",
      key: "sendEmail",
      label: t("dashboard.actions.sendEmail"),
      icon: <MailIcon size={18} />,
      onClick: () =>
        openModal({
          type: EModalsTypes.DASHBOARD_SEND_BY_EMAIL,
          options: { fileId: file.id, filename: file.filename },
        }),
    },
    { type: "divider", key: "div-2" },
    {
      type: "action",
      key: "delete",
      label: t("dashboard.actions.delete"),
      icon: <TrashIcon size={18} />,
      destructive: true,
      onClick: () =>
        openModal({
          type: EModalsTypes.DASHBOARD_DELETE_FILES,
          options: { ids: [file.id], filename: file.filename },
        }),
    },
  ];

  const dropdownBase =
    "bg-white rounded-2xl p-2 shadow-[0px_6px_12px_-2px_rgba(0,0,0,0.08),0px_8px_40px_0px_rgba(0,0,0,0.08)] flex flex-col gap-0.5";

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {/* Tools button */}
      <button
        ref={toolsBtnRef}
        type="button"
        aria-label={String(t("dashboard.tools.convertTo"))}
        onClick={openToolsMenu}
        className={cn(
          "text-text-secondary hover:text-text-primary flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-[rgba(0,0,0,0.06)]",
          openMenu === "tools" && "text-text-primary bg-[rgba(0,0,0,0.06)]"
        )}
      >
        <AppsIcon size={20} />
      </button>

      {/* Three-dots button */}
      <button
        ref={mainBtnRef}
        type="button"
        aria-label={String(t("dashboard.actions.more"))}
        onClick={openMainMenu}
        className={cn(
          "text-text-secondary hover:text-text-primary flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-[rgba(0,0,0,0.06)]",
          openMenu === "main" && "text-text-primary bg-[rgba(0,0,0,0.06)]"
        )}
      >
        <MoreHorizontalIcon size={20} />
      </button>

      {/* ── Tools dropdown portal ── */}
      {!isMobile &&
        openMenu === "tools" &&
        toolsPos &&
        createPortal(
          <div
            id="tools-menu-portal"
            style={{
              position: "fixed",
              top: toolsPos.top,
              right: toolsPos.right,
              width: MENU_WIDTH,
              zIndex: 9999,
            }}
            className={dropdownBase}
          >
            {/* Convert to... (with submenu) */}
            <button
              ref={convertItemRef}
              type="button"
              onMouseEnter={handleConvertHover}
              onClick={handleConvertActivate}
              className="flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-[10px] bg-[var(--color-state-primary-hover)] px-2 py-2 text-start text-base transition-colors hover:bg-[var(--color-primary-opacity-12)]"
            >
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-[var(--color-primary-dark)]">
                <ConvertIcon size={18} />
              </span>
              <span className="flex-1 text-[16px] leading-[22px] font-normal text-[var(--color-primary-dark)]">
                {String(t("dashboard.tools.convertTo"))}
              </span>
              <ChevronRightIcon
                size={18}
                className="text-[var(--color-primary-dark)]"
              />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                close();
                void handleCompress(file);
              }}
              className={menuItemCls}
            >
              <span className="text-text-secondary flex h-5 w-5 flex-shrink-0 items-center justify-center">
                <CompressIcon size={18} />
              </span>
              <span className="text-text-primary text-[16px] leading-[22px]">
                {String(t("dashboard.tools.compress"))}
              </span>
            </button>

            {/* TODO: uncomment watermark and sign when features are available on prod
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); close(); }}
              className={menuItemCls}
            >
              <span className="text-text-secondary flex h-5 w-5 flex-shrink-0 items-center justify-center">
                <WatermarkIcon size={18} />
              </span>
              <span className="text-text-primary text-[16px] leading-[22px]">Add watermark</span>
            </button>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); close(); }}
              className={menuItemCls}
            >
              <span className="text-text-secondary flex h-5 w-5 flex-shrink-0 items-center justify-center">
                <SignIcon size={18} />
              </span>
              <span className="text-text-primary text-[16px] leading-[22px]">Sign</span>
            </button>
            */}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                close();
                void handleTranslate(file);
              }}
              className={menuItemCls}
            >
              <span className="text-text-secondary flex h-5 w-5 flex-shrink-0 items-center justify-center">
                <TranslateIcon size={18} />
              </span>
              <span className="text-text-primary flex-1 text-[16px] leading-[22px]">
                {String(t("dashboard.tools.translate"))}
              </span>
              <span className="flex items-center gap-1 rounded-md border border-white bg-[var(--color-primary-opacity-50)] px-2 py-1 text-white">
                <StarIcon size={10} />
                <span className="text-[10px] font-medium tracking-wide uppercase">
                  AI
                </span>
              </span>
            </button>
          </div>,
          document.body
        )}

      {/* ── Convert submenu portal ── */}
      {!isMobile &&
        showConvertSub &&
        convertSubPos &&
        openMenu === "tools" &&
        createPortal(
          <div
            id="convert-sub-portal"
            style={{
              position: "fixed",
              top: convertSubPos.top,
              right: convertSubPos.right,
              width: MENU_WIDTH,
              zIndex: 10000,
            }}
            className={dropdownBase}
            onMouseLeave={() => setShowConvertSub(false)}
          >
            {convertFormatItems.map((fmt) => (
              <button
                key={fmt.label}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  close();
                  void handleConvertTo(file, fmt.format);
                }}
                className={menuItemCls}
              >
                <img
                  src={fmt.badge}
                  alt=""
                  className="h-5 w-5 flex-shrink-0 rounded-[5px]"
                />
                <span className="text-text-primary text-[16px] leading-[22px]">
                  {fmt.label}
                </span>
              </button>
            ))}
          </div>,
          document.body
        )}

      {/* ── Main (⋮) dropdown portal ── */}
      {!isMobile &&
        openMenu === "main" &&
        mainPos &&
        createPortal(
          <div
            id="main-menu-portal"
            style={{
              position: "fixed",
              top: mainPos.top,
              right: mainPos.right,
              width: MENU_WIDTH,
              zIndex: 9999,
            }}
            className={dropdownBase}
          >
            {mainMenuItems.map((item) =>
              item.type === "divider" ? (
                <div key={item.key} className="px-3 py-1">
                  <div className="h-px bg-[var(--color-os-divider)]" />
                </div>
              ) : (
                <button
                  key={item.key}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    close();
                    item.onClick();
                  }}
                  className={cn(
                    menuItemCls,
                    item.destructive
                      ? "text-[var(--color-error-main)] hover:bg-[var(--color-error-state-hover-opacity)]"
                      : ""
                  )}
                >
                  <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center">
                    {item.icon}
                  </span>
                  <span className="text-[16px] leading-[22px]">
                    {String(item.label)}
                  </span>
                </button>
              )
            )}
          </div>,
          document.body
        )}

      {isMobile &&
        openMenu &&
        createPortal(
          <div className="fixed inset-0 z-[10000] flex items-end">
            <div
              className="absolute inset-0 bg-[rgba(0,0,0,0.3)]"
              onClick={close}
            />
            <div
              id="mobile-menu-portal"
              className={cn(
                dropdownBase,
                "relative max-h-[80vh] w-full overflow-y-auto rounded-t-2xl rounded-b-none p-3 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))]"
              )}
            >
              {openMenu === "main" &&
                mainMenuItems.map((item) =>
                  item.type === "divider" ? (
                    <div key={item.key} className="px-3 py-1">
                      <div className="h-px bg-[var(--color-os-divider)]" />
                    </div>
                  ) : (
                    <button
                      key={item.key}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        close();
                        item.onClick();
                      }}
                      className={cn(
                        menuItemCls,
                        item.destructive
                          ? "text-[var(--color-error-main)] hover:bg-[var(--color-error-state-hover-opacity)]"
                          : ""
                      )}
                    >
                      <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center">
                        {item.icon}
                      </span>
                      <span className="text-[16px] leading-[22px]">
                        {String(item.label)}
                      </span>
                    </button>
                  )
                )}

              {openMenu === "tools" && !showConvertSub && (
                <>
                  <button
                    ref={convertItemRef}
                    type="button"
                    onClick={handleConvertActivate}
                    className="flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-[10px] bg-[var(--color-state-primary-hover)] px-2 py-2 text-start text-base transition-colors hover:bg-[var(--color-primary-opacity-12)]"
                  >
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-[var(--color-primary-dark)]">
                      <ConvertIcon size={18} />
                    </span>
                    <span className="flex-1 text-[16px] leading-[22px] font-normal text-[var(--color-primary-dark)]">
                      {String(t("dashboard.tools.convertTo"))}
                    </span>
                    <ChevronRightIcon
                      size={18}
                      className="text-[var(--color-primary-dark)]"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      close();
                      void handleCompress(file);
                    }}
                    className={menuItemCls}
                  >
                    <span className="text-text-secondary flex h-5 w-5 flex-shrink-0 items-center justify-center">
                      <CompressIcon size={18} />
                    </span>
                    <span className="text-text-primary text-[16px] leading-[22px]">
                      {String(t("dashboard.tools.compress"))}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      close();
                      void handleTranslate(file);
                    }}
                    className={menuItemCls}
                  >
                    <span className="text-text-secondary flex h-5 w-5 flex-shrink-0 items-center justify-center">
                      <TranslateIcon size={18} />
                    </span>
                    <span className="text-text-primary flex-1 text-[16px] leading-[22px]">
                      {String(t("dashboard.tools.translate"))}
                    </span>
                    <span className="flex items-center gap-1 rounded-md border border-white bg-[var(--color-primary-opacity-50)] px-2 py-1 text-white">
                      <StarIcon size={10} />
                      <span className="text-[10px] font-medium tracking-wide uppercase">
                        AI
                      </span>
                    </span>
                  </button>
                </>
              )}

              {openMenu === "tools" && showConvertSub && (
                <>
                  <div className="flex items-center gap-1 px-1 pb-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowConvertSub(false);
                      }}
                      aria-label={String(t("global.back"))}
                      className="text-text-secondary hover:text-text-primary flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-[rgba(0,0,0,0.06)]"
                    >
                      <ChevronRightIcon size={18} className="rotate-180" />
                    </button>
                    <span className="text-text-primary text-[16px] leading-[22px] font-medium">
                      {String(t("dashboard.tools.convertTo"))}
                    </span>
                  </div>

                  {convertFormatItems.map((fmt) => (
                    <button
                      key={fmt.label}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        close();
                        void handleConvertTo(file, fmt.format);
                      }}
                      className={menuItemCls}
                    >
                      <img
                        src={fmt.badge}
                        alt=""
                        className="h-5 w-5 flex-shrink-0 rounded-[5px]"
                      />
                      <span className="text-text-primary text-[16px] leading-[22px]">
                        {fmt.label}
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
