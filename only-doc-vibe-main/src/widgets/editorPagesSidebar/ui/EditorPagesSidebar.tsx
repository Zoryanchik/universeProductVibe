import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@universe-forma/ui-pes";

import { useTranslation } from "@/shared/lib/translations/useTranslation";

import {
  addPageRendered,
  captureCurrentPageThumbnail,
  deletePageRendered,
  EDITOR_HISTORY_RESTORED_EVENT,
  generatePdfThumbnails,
  getCurrentPageFromStore,
  getTemplatePageCount,
  goToPageRendered,
  isEditorHistoryNavigation,
  PAGE_THUMBNAIL_PLACEHOLDER,
  PAGE_THUMBNAIL_UPDATE_EVENT,
  PDF_EDITOR_PAGE_LOADED_EVENT,
  queuePostHistoryThumbnailCapture,
  renderPageThumbnailAt,
  renderPageThumbnails,
  useEditor,
} from "@/features/editor";
import type { EditorHistoryRunResult } from "@/features/editor";
import type {
  EditorPageThumbnail,
  PageThumbnailUpdateDetail,
} from "@/features/editor";

interface PageMenuState {
  readonly page: number;
  readonly x: number;
  readonly y: number;
}

const MENU_WIDTH = 210;

const insertPageThumbnail = (
  current: EditorPageThumbnail[],
  thumbnail: EditorPageThumbnail,
  insertIndex: number
): EditorPageThumbnail[] => {
  const next = [...current];
  next.splice(insertIndex, 0, thumbnail);

  return next.map((item, index) => ({ ...item, page: index + 1 }));
};

const removePageThumbnail = (
  current: EditorPageThumbnail[],
  removeIndex: number
): EditorPageThumbnail[] =>
  current
    .filter((_, index) => index !== removeIndex)
    .map((item, index) => ({ ...item, page: index + 1 }));

const replacePageThumbnail = (
  current: EditorPageThumbnail[],
  thumbnail: EditorPageThumbnail
): EditorPageThumbnail[] => {
  const index = thumbnail.page - 1;
  if (index < 0) return current;

  const next = [...current];

  while (next.length <= index) {
    next.push({
      page: next.length + 1,
      dataUrl: PAGE_THUMBNAIL_PLACEHOLDER,
    });
  }

  next[index] = thumbnail;

  return next;
};

/**
 * Fills a page's preview from an offscreen pdfjs render, but only if it is still
 * a placeholder. A real (SDK-captured / edited) thumbnail always wins so pdfjs —
 * which renders the *original* PDF — never reverts a page the user has changed.
 */
const mergePdfThumbnail = (
  current: EditorPageThumbnail[],
  thumbnail: EditorPageThumbnail
): EditorPageThumbnail[] => {
  const index = thumbnail.page - 1;
  if (index < 0) return current;

  const existing = current[index];
  if (existing?.dataUrl && existing.dataUrl !== PAGE_THUMBNAIL_PLACEHOLDER) {
    return current;
  }

  return replacePageThumbnail(current, thumbnail);
};

export const EditorPagesSidebar: React.FC = () => {
  const { t } = useTranslation();
  const {
    instance,
    pageCount,
    currentPage,
    setCurrentPage,
    setPageCount,
    isDocumentLoaded,
    setIsInitialThumbnailsRendered,
    documentSource,
  } = useEditor();
  const [collapsed, setCollapsed] = useState(false);
  const [menu, setMenu] = useState<PageMenuState | null>(null);
  const [thumbnails, setThumbnails] = useState<EditorPageThumbnail[]>([]);
  const [isRenderingThumbnails, setIsRenderingThumbnails] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const thumbnailsLoadedRef = useRef(false);
  const prevPageCountRef = useRef(0);
  const thumbnailsRef = useRef<EditorPageThumbnail[]>([]);
  /** Prevents pageCount effect from running full thumbnail refresh after undo/redo. */
  const skipPageCountThumbnailSyncRef = useRef(false);
  /** Source we already kicked pdfjs thumbnail generation for (avoids re-runs). */
  const pdfThumbsSourceRef = useRef<string | null>(null);
  /** Pages with a real SDK/edited capture — pdfjs must not overwrite these. */
  const sdkCapturedPagesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    thumbnailsRef.current = thumbnails;
  }, [thumbnails]);

  const pageItems = useMemo(
    () => Array.from({ length: pageCount }, (_, index) => index + 1),
    [pageCount]
  );

  const goToPage = useCallback(
    (page: number) => {
      if (!instance || !isDocumentLoaded) return;

      void goToPageRendered(instance, page);
      setCurrentPage(page);
    },
    [instance, isDocumentLoaded, setCurrentPage]
  );

  const openPageMenu = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, page: number) => {
      if (!isDocumentLoaded) return;

      event.preventDefault();
      event.stopPropagation();

      setMenu({
        page,
        x: Math.min(event.clientX, window.innerWidth - MENU_WIDTH - 12),
        y: Math.min(event.clientY, window.innerHeight - 56),
      });
    },
    [isDocumentLoaded]
  );

  const refreshThumbnails = useCallback(async () => {
    if (!instance || !isDocumentLoaded) {
      setThumbnails([]);

      return;
    }

    if (isEditorHistoryNavigation()) return;

    setIsRenderingThumbnails(true);

    try {
      const nextThumbnails = await renderPageThumbnails(instance);
      setThumbnails(nextThumbnails);
    } finally {
      setIsRenderingThumbnails(false);
    }
  }, [instance, isDocumentLoaded]);

  const updateThumbnailForPage = useCallback(
    async (page: number) => {
      if (!instance || !isDocumentLoaded || isEditorHistoryNavigation()) {
        return;
      }

      const activePage = getCurrentPageFromStore(instance);
      const thumbnail =
        page === activePage
          ? await captureCurrentPageThumbnail(instance, page)
          : await renderPageThumbnailAt(instance, page);

      if (!thumbnail) return;

      // This page now reflects the live/edited canvas — pin it so the async
      // pdfjs pass (original PDF) does not overwrite it.
      sdkCapturedPagesRef.current.add(page);
      setThumbnails((current) => replacePageThumbnail(current, thumbnail));
    },
    [instance, isDocumentLoaded]
  );

  const createPage = useCallback(async () => {
    if (!instance || !menu || !isDocumentLoaded) return;

    const insertIndex = menu.page;
    const nextPage = await addPageRendered(instance, "below", menu.page);
    if (!nextPage) {
      setMenu(null);

      return;
    }

    const totalPages = getTemplatePageCount(instance);
    prevPageCountRef.current = totalPages;
    setPageCount(totalPages);
    setCurrentPage(nextPage);

    const thumbnail = await renderPageThumbnailAt(instance, nextPage);
    if (thumbnail) {
      setThumbnails((current) =>
        insertPageThumbnail(current, thumbnail, insertIndex)
      );
    } else {
      void refreshThumbnails();
    }

    setMenu(null);
  }, [
    instance,
    isDocumentLoaded,
    menu,
    refreshThumbnails,
    setCurrentPage,
    setPageCount,
  ]);

  const deletePage = useCallback(async () => {
    if (!instance || !menu || !isDocumentLoaded || pageCount <= 1) return;

    const deletedPage = menu.page;
    const nextPage = await deletePageRendered(instance, deletedPage);
    if (nextPage) {
      const totalPages = getTemplatePageCount(instance);
      prevPageCountRef.current = totalPages;
      setCurrentPage(nextPage);
      setPageCount(totalPages);
      setThumbnails((current) => removePageThumbnail(current, deletedPage - 1));
    }

    setMenu(null);
  }, [
    instance,
    isDocumentLoaded,
    menu,
    pageCount,
    setCurrentPage,
    setPageCount,
  ]);

  useEffect(() => {
    if (!isDocumentLoaded) {
      thumbnailsLoadedRef.current = false;
      prevPageCountRef.current = 0;
      pdfThumbsSourceRef.current = null;
      sdkCapturedPagesRef.current = new Set();
      setThumbnails([]);
      setIsInitialThumbnailsRendered(false);

      return;
    }

    if (pageCount === 0) return;

    if (!thumbnailsLoadedRef.current) {
      thumbnailsLoadedRef.current = true;
      prevPageCountRef.current = pageCount;
      // Previews are now generated offscreen via pdfjs (see the effect below),
      // which never hides the Fabric canvas — so the page is interactive as
      // soon as it paints. No SDK hidden-capture pass on load anymore.
      setIsInitialThumbnailsRendered(true);

      return;
    }

    const prevCount = prevPageCountRef.current;
    if (pageCount === prevCount) return;

    if (skipPageCountThumbnailSyncRef.current || isEditorHistoryNavigation()) {
      prevPageCountRef.current = pageCount;

      return;
    }

    prevPageCountRef.current = pageCount;

    if (!instance) return;

    if (pageCount === prevCount + 1) {
      const insertIndex = currentPage - 1;

      void renderPageThumbnailAt(instance, currentPage).then((thumbnail) => {
        if (!thumbnail) {
          void refreshThumbnails();

          return;
        }

        setThumbnails((current) => {
          if (current.length >= pageCount && current[insertIndex]?.dataUrl) {
            return current;
          }

          return insertPageThumbnail(current, thumbnail, insertIndex);
        });
      });

      return;
    }

    if (pageCount !== prevCount) {
      void refreshThumbnails();
    }
  }, [
    currentPage,
    instance,
    isDocumentLoaded,
    pageCount,
    refreshThumbnails,
    setIsInitialThumbnailsRendered,
  ]);

  useEffect(() => {
    if (!instance || !isDocumentLoaded) return;

    const onThumbnailUpdate = (event: Event) => {
      const page = (event as CustomEvent<PageThumbnailUpdateDetail>).detail
        ?.page;

      if (!page) return;

      void updateThumbnailForPage(page);
    };

    window.addEventListener(PAGE_THUMBNAIL_UPDATE_EVENT, onThumbnailUpdate);

    return () => {
      window.removeEventListener(
        PAGE_THUMBNAIL_UPDATE_EVENT,
        onThumbnailUpdate
      );
    };
  }, [instance, isDocumentLoaded, updateThumbnailForPage]);

  // Large PDFs stream pages in the background (page 1 loads immediately). Only
  // refresh the *active* page's thumbnail as its real content arrives — this is
  // cheap and never flips/hides the visible canvas. Streamed-but-unvisited pages
  // keep their placeholder thumbnail until the user navigates to them (which
  // renders + captures them naturally). We intentionally do NOT run a full
  // refreshThumbnails() when streaming completes: that pass hides the canvas
  // (withCanvasCaptureHidden) while re-rendering every page, which looked like
  // the document "disappearing" seconds after it loaded.
  useEffect(() => {
    if (!instance || !isDocumentLoaded) return;

    const onPageLoaded = (event: Event) => {
      const pageIndex = (event as CustomEvent<{ pageIndex?: number }>).detail
        ?.pageIndex;

      if (typeof pageIndex !== "number") return;

      const page = pageIndex + 1;
      if (page === getCurrentPageFromStore(instance)) {
        void updateThumbnailForPage(page);
      }
    };

    window.addEventListener(PDF_EDITOR_PAGE_LOADED_EVENT, onPageLoaded);

    return () => {
      window.removeEventListener(PDF_EDITOR_PAGE_LOADED_EVENT, onPageLoaded);
    };
  }, [instance, isDocumentLoaded, updateThumbnailForPage]);

  // Fill every page's preview by rendering the PDF offscreen with pdfjs. This is
  // independent of the SDK's Fabric canvas, so all thumbnails populate without
  // ever hiding/flipping the visible page. Pages the user has edited keep their
  // SDK capture (mergePdfThumbnail leaves non-placeholder entries untouched).
  useEffect(() => {
    if (!isDocumentLoaded || !documentSource) return;

    if (pdfThumbsSourceRef.current === documentSource) return;

    pdfThumbsSourceRef.current = documentSource;
    const source = documentSource;
    let cancelled = false;

    void generatePdfThumbnails(source, {
      isCancelled: () => cancelled,
      onPage: (thumbnail) => {
        if (cancelled || sdkCapturedPagesRef.current.has(thumbnail.page)) {
          return;
        }

        setThumbnails((current) => mergePdfThumbnail(current, thumbnail));
      },
    });

    return () => {
      cancelled = true;
    };
  }, [isDocumentLoaded, documentSource]);

  useEffect(() => {
    if (!instance || !isDocumentLoaded) return;

    const onHistoryRestored = (event: Event) => {
      const detail = (event as CustomEvent<EditorHistoryRunResult>).detail;
      if (!detail || !instance) return;

      const delta = detail.pageCount - detail.previousPageCount;

      skipPageCountThumbnailSyncRef.current = true;
      prevPageCountRef.current = detail.pageCount;
      setPageCount(detail.pageCount);
      setCurrentPage(detail.currentPage);

      window.setTimeout(() => {
        skipPageCountThumbnailSyncRef.current = false;
      }, 1200);

      if (delta === -1) {
        setThumbnails((current) =>
          current
            .filter((_, index) => index < detail.pageCount)
            .map((item, index) => ({ ...item, page: index + 1 }))
        );

        return;
      }

      if (delta === 1) {
        const missingPage = Array.from(
          { length: detail.pageCount },
          (_, index) => index + 1
        ).find(
          (page) => !thumbnailsRef.current.some((thumb) => thumb.page === page)
        );

        if (!missingPage) return;

        setThumbnails((current) =>
          insertPageThumbnail(
            current,
            { page: missingPage, dataUrl: PAGE_THUMBNAIL_PLACEHOLDER },
            missingPage - 1
          ).map((item, index) => ({ ...item, page: index + 1 }))
        );

        queuePostHistoryThumbnailCapture(() => {
          void renderPageThumbnailAt(instance, missingPage).then(
            (thumbnail) => {
              if (!thumbnail) return;

              setThumbnails((current) =>
                insertPageThumbnail(current, thumbnail, missingPage - 1).map(
                  (item, index) => ({ ...item, page: index + 1 })
                )
              );
            }
          );
        });

        return;
      }

      queuePostHistoryThumbnailCapture(() => {
        void updateThumbnailForPage(detail.currentPage);
      });
    };

    window.addEventListener(EDITOR_HISTORY_RESTORED_EVENT, onHistoryRestored);

    return () => {
      window.removeEventListener(
        EDITOR_HISTORY_RESTORED_EVENT,
        onHistoryRestored
      );
    };
  }, [
    instance,
    isDocumentLoaded,
    refreshThumbnails,
    setCurrentPage,
    setPageCount,
    updateThumbnailForPage,
  ]);

  useEffect(() => {
    const close = () => setMenu(null);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("click", close);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", close);

    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", close);
    };
  }, []);

  useEffect(() => {
    if (!menu || !menuRef.current) return;

    menuRef.current.style.left = `${menu.x}px`;
    menuRef.current.style.top = `${menu.y}px`;
  }, [menu]);

  useEffect(() => {
    if (collapsed) setMenu(null);
  }, [collapsed]);

  return (
    <aside
      aria-label={String(t("editor_page.pages_sidebar.thumbnails_aria"))}
      className={cn(
        "relative flex h-full shrink-0 flex-col border-e border-white/5 bg-[#1F2125] text-white/70 transition-[width]",
        collapsed ? "w-0" : "w-[184px]"
      )}
    >
      {!collapsed && (
        <div className="min-w-0 flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white">
              {String(t("editor_page.pages_sidebar.title"))}
            </h2>
            <p className="mt-1 text-xs text-white/45">
              {isRenderingThumbnails
                ? String(t("editor_page.pages_sidebar.rendering_thumbnails"))
                : String(t("editor_page.pages_sidebar.select_page_hint"))}
            </p>
          </div>

          <div className="space-y-3">
            {pageItems.map((page) => (
              <button
                key={page}
                type="button"
                disabled={!isDocumentLoaded}
                onClick={() => goToPage(page)}
                onContextMenu={(event) => openPageMenu(event, page)}
                className={cn(
                  "w-full rounded-lg border p-2 text-start transition-colors",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                  page === currentPage
                    ? "border-[#3B82F6] bg-[#3B82F6]/10"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                )}
              >
                <span className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded border border-black/10 bg-white text-xs font-semibold text-[#2A2D33]">
                  {thumbnails[page - 1]?.dataUrl ? (
                    <img
                      key={`${page}-${thumbnails[page - 1]?.dataUrl.slice(0, 24)}`}
                      src={thumbnails[page - 1]?.dataUrl}
                      alt={String(
                        t("editor_page.pages_sidebar.page_thumbnail_alt", {
                          page,
                        })
                      )}
                      className="h-full w-full object-contain"
                      draggable={false}
                    />
                  ) : (
                    <span className="text-white/30">{page}</span>
                  )}
                </span>
                <span className="mt-2 block text-xs text-white/70">
                  {String(t("editor_page.pages_sidebar.page_label", { page }))}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {menu && (
        <div
          ref={menuRef}
          className="fixed z-[1100] w-[210px] overflow-hidden rounded-lg border border-white/10 bg-[#1F2125] py-1 text-sm text-white shadow-2xl"
          role="menu"
        >
          <button
            type="button"
            role="menuitem"
            onClick={(event) => {
              event.stopPropagation();
              void createPage();
            }}
            className="flex w-full items-center justify-between gap-4 px-3 py-2 text-start text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <span>
              {String(t("editor_page.pages_sidebar.create_new_page"))}
            </span>
            <span className="text-xs text-white/40">
              {String(t("editor_page.pages_sidebar.enter_shortcut"))}
            </span>
          </button>

          <div className="mx-2 h-px bg-white/10" />

          <button
            type="button"
            role="menuitem"
            disabled={pageCount <= 1}
            onClick={(event) => {
              event.stopPropagation();
              void deletePage();
            }}
            className={cn(
              "flex w-full items-center justify-between gap-4 px-3 py-2 text-start transition-colors",
              "disabled:cursor-not-allowed disabled:text-white/30",
              pageCount <= 1
                ? "text-white/30"
                : "text-red-300 hover:bg-white/10 hover:text-red-200"
            )}
          >
            <span>{String(t("editor_page.pages_sidebar.delete_page"))}</span>
            <span className="text-xs text-white/40">
              {String(t("editor_page.pages_sidebar.delete_shortcut"))}
            </span>
          </button>
        </div>
      )}

      <button
        type="button"
        aria-label={
          collapsed
            ? String(t("editor_page.pages_sidebar.expand_panel"))
            : String(t("editor_page.pages_sidebar.collapse_panel"))
        }
        onClick={() => setCollapsed((value) => !value)}
        className={cn(
          // Hidden on mobile: the sidebar is a bottom-bar-driven drawer there,
          // so this collapse toggle would only resize an off-canvas panel.
          "absolute top-4 z-10 hidden h-7 w-7 items-center justify-center rounded-e-md bg-[#2A2D33] text-white/70 md:flex",
          "hover:bg-[#34383F] hover:text-white",
          collapsed ? "start-0" : "start-full"
        )}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(collapsed && "rotate-180")}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
    </aside>
  );
};
