import React, { useEffect, useState } from "react";
import { cn } from "@universe-forma/ui-pes";

import { useTranslation } from "@/shared/lib/translations/useTranslation";

import {
  callSdk,
  EDITOR_ZOOM_MAX,
  EDITOR_ZOOM_MIN,
  EDITOR_ZOOM_STEP,
  fitEditorToScreen,
  getEditorZoom,
  goToPageRendered,
  rotateCurrentPage,
  useEditor,
} from "@/features/editor";

import {
  FitToScreenIcon,
  RotatePageIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "./BottomBarIcons";

const BottomBarIconButton: React.FC<{
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  compact?: boolean;
  "data-testid"?: string;
  children: React.ReactNode;
}> = ({
  label,
  onClick,
  disabled,
  compact,
  "data-testid": dataTestId,
  children,
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    data-testid={dataTestId}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "flex shrink-0 items-center justify-center text-[#EEEEEE] transition-colors",
      compact
        ? "size-5 rounded p-0.5 hover:bg-white/10"
        : "rounded-lg p-1.5 hover:bg-white/10",
      "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
    )}
  >
    {children}
  </button>
);

const BottomBarDivider: React.FC = () => (
  <div className="h-5 w-px shrink-0 bg-white/16" aria-hidden />
);

const PagesPanelIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect
      x="4"
      y="3"
      width="10"
      height="14"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M17 6h3v13a2 2 0 0 1-2 2H8"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const PropertiesPanelIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M5 7h14M5 12h14M5 17h14"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <circle cx="9" cy="7" r="2" fill="currentColor" />
    <circle cx="15" cy="12" r="2" fill="currentColor" />
    <circle cx="8" cy="17" r="2" fill="currentColor" />
  </svg>
);

interface EditorBottomBarProps {
  readonly onOpenPages?: () => void;
  readonly onOpenProperties?: () => void;
}

export const EditorBottomBar: React.FC<EditorBottomBarProps> = ({
  onOpenPages,
  onOpenProperties,
}) => {
  const { t } = useTranslation();
  const {
    instance,
    pageCount,
    currentPage,
    setCurrentPage,
    zoom,
    setZoom,
    isDocumentLoaded,
  } = useEditor();
  const [pageInput, setPageInput] = useState(String(currentPage));
  const isDisabled = !isDocumentLoaded;

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const goToPage = (next: number) => {
    if (!instance || !isDocumentLoaded || pageCount === 0) return;

    const clamped = Math.min(Math.max(1, next), Math.max(1, pageCount));
    void goToPageRendered(instance, clamped);
    setCurrentPage(clamped);
  };

  const applyZoom = (next: number) => {
    if (!instance || !isDocumentLoaded) return;

    const clamped = Math.min(Math.max(EDITOR_ZOOM_MIN, next), EDITOR_ZOOM_MAX);
    callSdk(instance, "setZoom", clamped);
    setZoom(clamped);
  };

  const syncZoomFromSdk = () => {
    if (!instance) return;

    const nextZoom = getEditorZoom(instance);
    if (Number.isFinite(nextZoom) && nextZoom > 0) {
      setZoom(nextZoom);
    }
  };

  const fitToScreen = () => {
    if (!instance || !isDocumentLoaded) return;

    fitEditorToScreen(instance);
    window.requestAnimationFrame(syncZoomFromSdk);
  };

  const rotatePage = () => {
    if (!instance || !isDocumentLoaded) return;

    rotateCurrentPage(instance, -90);
    window.requestAnimationFrame(syncZoomFromSdk);
  };

  useEffect(() => {
    if (!instance || !isDocumentLoaded || pageCount === 0) return;

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }

      if (e.key === "PageDown" || e.key === "ArrowRight") {
        e.preventDefault();
        goToPage(currentPage + 1);
      } else if (e.key === "PageUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        goToPage(currentPage - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goToPage(1);
      } else if (e.key === "End") {
        e.preventDefault();
        goToPage(pageCount);
      }
    };
    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance, isDocumentLoaded, pageCount, currentPage]);

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div
      aria-disabled={isDisabled}
      className={cn(
        "pointer-events-auto inline-flex max-w-[calc(100vw-1rem)] items-center gap-2 rounded-lg sm:gap-3",
        // Never clip options on narrow screens: fit tighter, then scroll if needed.
        "overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "bg-black/75 px-2 py-1 shadow-[0px_2px_8px_2px_rgba(0,0,0,0.2)] backdrop-blur-[30px] sm:px-4",
        isDisabled && "pointer-events-none opacity-40"
      )}
    >
      {onOpenPages && (
        <span className="flex items-center gap-3 md:hidden">
          <BottomBarIconButton
            label={String(t("editor_page.bottom_bar.open_pages"))}
            onClick={onOpenPages}
            disabled={isDisabled}
          >
            <PagesPanelIcon />
          </BottomBarIconButton>
          <BottomBarDivider />
        </span>
      )}

      <BottomBarIconButton
        label={String(t("editor_page.bottom_bar.fit_to_screen"))}
        onClick={fitToScreen}
        disabled={isDisabled}
      >
        <FitToScreenIcon />
      </BottomBarIconButton>

      <BottomBarIconButton
        label={String(t("editor_page.bottom_bar.rotate_page"))}
        onClick={rotatePage}
        disabled={isDisabled}
        data-testid="editor-rotate-page"
      >
        <RotatePageIcon />
      </BottomBarIconButton>

      <BottomBarDivider />

      <div className="flex items-center gap-1">
        <input
          type="text"
          inputMode="numeric"
          disabled={isDisabled}
          aria-label={String(
            t("editor_page.pages_sidebar.page_label", { page: currentPage })
          )}
          value={pageInput}
          onChange={(e) => setPageInput(e.target.value.replace(/[^0-9]/g, ""))}
          onBlur={() => {
            const parsed = Number.parseInt(pageInput, 10);
            if (Number.isFinite(parsed)) {
              goToPage(parsed);
            } else {
              setPageInput(String(currentPage));
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur();
            }
          }}
          className={cn(
            "size-8 rounded-lg bg-black/32 px-2 py-1 text-center text-[13px] leading-[18px] font-semibold text-[#EEEEEE] outline-none",
            "focus:bg-black/40 disabled:cursor-not-allowed disabled:opacity-60"
          )}
        />
        <span className="text-[13px] leading-[18px] font-semibold whitespace-nowrap text-[#9E9E9E]">
          / {pageCount || "—"}
        </span>
      </div>

      <BottomBarDivider />

      <div className="flex h-8 items-center gap-1 rounded-lg bg-black/32 p-1">
        <BottomBarIconButton
          compact
          label={String(t("editor_page.bottom_bar.zoom_out"))}
          onClick={() => applyZoom(zoom - EDITOR_ZOOM_STEP)}
          disabled={isDisabled}
        >
          <ZoomOutIcon />
        </BottomBarIconButton>

        <span className="w-11 text-center text-[13px] leading-[18px] font-semibold text-[#9E9E9E]">
          {zoomPercent}%
        </span>

        <BottomBarIconButton
          compact
          label={String(t("editor_page.bottom_bar.zoom_in"))}
          onClick={() => applyZoom(zoom + EDITOR_ZOOM_STEP)}
          disabled={isDisabled}
        >
          <ZoomInIcon />
        </BottomBarIconButton>
      </div>

      {onOpenProperties && (
        <span className="flex items-center gap-3 md:hidden">
          <BottomBarDivider />
          <BottomBarIconButton
            label={String(t("editor_page.bottom_bar.open_properties"))}
            onClick={onOpenProperties}
            disabled={isDisabled}
          >
            <PropertiesPanelIcon />
          </BottomBarIconButton>
        </span>
      )}
    </div>
  );
};
