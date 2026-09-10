"use client";

import { useEffect, useRef, useState } from "react";

import { useTranslation } from "@/shared/lib/translations/useTranslation";

import { getDocumentById } from "@/entities/documents";
import {
  consumeEditorHandoffPdf,
  finalizeEditorHandoff,
  setFilename as persistDocumentFilename,
  useDocumentsStore,
} from "@/entities/documents";

import { usePdfEditor } from "../model/usePdfEditor";
import { useEditorState } from "../model/useEditorState";
import { useEditor } from "../model/EditorContext";
import {
  captureExportBaseline,
  getPageSettings,
  goToPageRendered,
  isEditorHistoryNavigation,
  PDF_EDITOR_ALL_PAGES_LOADED_EVENT,
  PDF_EDITOR_PAGE_LOADED_EVENT,
  PDF_EDITOR_ZOOM_CHANGED_EVENT,
  recordHistorySnapshot,
  subscribeToCanvasHistory,
  subscribeToSelection,
} from "../model/sdkBindings";
import { ElementContextMenu } from "./ElementContextMenu";

interface PdfEditorCanvasProps {
  className?: string;
}

export const PdfEditorCanvas: React.FC<PdfEditorCanvasProps> = ({
  className,
}) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [documentUrl, setDocumentUrl] = useState<string | undefined>(undefined);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  const pdfFileContent = useDocumentsStore.use.pdfFileContent();
  const storedDocumentId = useDocumentsStore.use.documentId();
  const editorHandoffPdfRef = useRef<string | null>(null);
  const [handoffChecked, setHandoffChecked] = useState(false);

  const {
    setInstance,
    setPageCount,
    setZoom,
    setCurrentPage,
    openDownload,
    instance,
    setIsDocumentLoaded,
    isDocumentLoaded,
    setIsDocumentLoading,
    setSelectedElement,
    setPageSettings,
    setFilename: setEditorFilename,
    documentToLoad,
    clearDocumentToLoad,
    setDocumentSource,
  } = useEditor();

  const storedFilename = useDocumentsStore.use.filename();

  useEffect(() => {
    let cancelled = false;

    void consumeEditorHandoffPdf().then((pdf) => {
      if (cancelled) return;

      editorHandoffPdfRef.current = pdf;
      setHandoffChecked(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!handoffChecked) return;

    const handoffPdf = editorHandoffPdfRef.current;

    if (handoffPdf) {
      setDocumentUrl(handoffPdf);

      return;
    }

    if (pdfFileContent) {
      setDocumentUrl(pdfFileContent);

      return;
    }

    const params = new URLSearchParams(window.location.search);
    const docId = params.get("docId") || storedDocumentId;
    if (!docId) return;

    setIsLoadingDoc(true);
    getDocumentById(docId)
      .then((doc) => {
        setDocumentUrl(doc.url);
      })
      .catch((err) => {
        console.error("[PdfEditor] Failed to fetch document:", err);
        setDocError(String(t("editor_page.canvas.load_failed")));
      })
      .finally(() => {
        setIsLoadingDoc(false);
      });
  }, [handoffChecked, pdfFileContent, storedDocumentId, t]);

  useEffect(() => {
    setIsDocumentLoaded(false);
    // Expose the resolved source so the pages sidebar can render all page
    // thumbnails offscreen via pdfjs (no SDK canvas flipping/hiding).
    setDocumentSource(documentUrl ?? null);

    if (!documentUrl) {
      setEditorFilename("");
    }
  }, [documentUrl, setIsDocumentLoaded, setEditorFilename, setDocumentSource]);

  // Drives the blocking loader so the user cannot interact before the PDF is ready.
  const isResolvingOrRendering =
    !docError &&
    (!handoffChecked || isLoadingDoc || (!!documentUrl && !isDocumentLoaded));

  useEffect(() => {
    setIsDocumentLoading(isResolvingOrRendering);
  }, [isResolvingOrRendering, setIsDocumentLoading]);

  useEffect(() => {
    if (!documentToLoad) return;

    setDocumentUrl(documentToLoad.url);

    if (documentToLoad.filename) {
      setEditorFilename(documentToLoad.filename);
      persistDocumentFilename(documentToLoad.filename);
    }

    clearDocumentToLoad();
  }, [documentToLoad, clearDocumentToLoad, setEditorFilename]);

  usePdfEditor(containerRef, documentUrl, {
    onReady: (sdkInstance) => {
      setInstance(sdkInstance);
    },
    onExportRequested: () => {
      openDownload();
    },
    onDocumentLoaded: async () => {
      void finalizeEditorHandoff();

      // `loadPDF` resolves before the first page is painted; render it
      // explicitly so the page is interactive before the loader is hidden.
      try {
        await goToPageRendered(instance, 1);
      } catch {
        // mark the document as loaded anyway
      }

      setIsDocumentLoaded(true);
      setSelectedElement(null);
      setPageSettings(getPageSettings(instance));

      // Snapshot the unedited page content now so PDF export can later reuse the
      // original vector pages for anything the user doesn't change.
      captureExportBaseline(instance);

      if (storedFilename) {
        setEditorFilename(storedFilename);
      }
    },
    onDocumentLoadError: () => {
      setIsDocumentLoaded(false);
      setSelectedElement(null);
      setPageSettings(null);
      setEditorFilename("");
    },
  });

  const runtime = useEditorState(instance);
  useEffect(() => {
    if (isEditorHistoryNavigation()) return;

    setPageCount(runtime.pageCount);
    setZoom(runtime.zoom);
    setCurrentPage(runtime.currentPage);
    setPageSettings(getPageSettings(instance));
  }, [
    runtime.pageCount,
    runtime.zoom,
    runtime.currentPage,
    setPageCount,
    setZoom,
    setCurrentPage,
    setPageSettings,
    instance,
  ]);

  useEffect(() => {
    if (!instance || !isDocumentLoaded) return;

    return subscribeToSelection(instance, setSelectedElement);
  }, [instance, isDocumentLoaded, setSelectedElement]);

  useEffect(() => {
    if (!instance || !isDocumentLoaded) return;

    return subscribeToCanvasHistory(instance);
  }, [instance, isDocumentLoaded]);

  useEffect(() => {
    if (!instance || !isDocumentLoaded) return;

    recordHistorySnapshot(instance);
  }, [instance, isDocumentLoaded]);

  // Large PDFs stream pages after the initial load. Capture each page's unedited
  // baseline as it arrives (captureExportBaseline records every page only once,
  // before edits) so vector reuse on export covers the whole document.
  useEffect(() => {
    if (!instance || !isDocumentLoaded) return;

    const capture = () => captureExportBaseline(instance);
    window.addEventListener(PDF_EDITOR_PAGE_LOADED_EVENT, capture);
    window.addEventListener(PDF_EDITOR_ALL_PAGES_LOADED_EVENT, capture);

    return () => {
      window.removeEventListener(PDF_EDITOR_PAGE_LOADED_EVENT, capture);
      window.removeEventListener(PDF_EDITOR_ALL_PAGES_LOADED_EVENT, capture);
    };
  }, [instance, isDocumentLoaded]);

  // Keep the zoom indicator in sync with a touch pinch gesture, which drives the
  // page-column zoom from inside the SDK (bypassing the +/- controls).
  useEffect(() => {
    const onZoomChanged = (event: Event) => {
      const nextZoom = (event as CustomEvent<{ zoom?: number }>).detail?.zoom;
      if (
        typeof nextZoom === "number" &&
        Number.isFinite(nextZoom) &&
        nextZoom > 0
      ) {
        setZoom(nextZoom);
      }
    };
    window.addEventListener(PDF_EDITOR_ZOOM_CHANGED_EVENT, onZoomChanged);

    return () => {
      window.removeEventListener(PDF_EDITOR_ZOOM_CHANGED_EVENT, onZoomChanged);
    };
  }, [setZoom]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setDocumentUrl(reader.result);
        setEditorFilename(file.name);
        persistDocumentFilename(file.name);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div
      tabIndex={-1}
      className={`pdf-editor-scope relative flex h-full w-full flex-col bg-[#2A2D33] outline-none ${className ?? ""}`}
      onMouseDown={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("input, textarea, button, label, select, a")) {
          return;
        }

        (event.currentTarget as HTMLElement).focus({ preventScroll: true });
      }}
    >
      <div className="relative flex-1 overflow-hidden">
        {docError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#2A2D33]/80">
            <span className="text-sm text-red-400">{docError}</span>
          </div>
        )}

        {!documentUrl && handoffChecked && !isLoadingDoc && !docError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#2A2D33]">
            <span className="text-sm text-white/70">
              {String(t("editor_page.canvas.no_document"))}
            </span>
            <label className="cursor-pointer rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]">
              {String(t("editor_page.canvas.open_pdf"))}
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}

        <div ref={containerRef} className="h-full w-full" />
        <ElementContextMenu />
      </div>
    </div>
  );
};
