"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@universe-forma/ui-pes";

import type { ELanguages } from "@/shared/constants/languages";
import { defaultLocale } from "@/shared/config/locale";
import { useTranslation } from "@/shared/lib/translations/useTranslation";

import { peekEditorHandoffPdf, useDocumentsStore } from "@/entities/documents";

import {
  EditorFunnelInit,
  EditorProvider,
  PdfEditorCanvas,
  useEditor,
} from "@/features/editor";
import { MergeWindow, SplitPdfModal } from "@/features/editorDocumentActions";
import { DownloadModal } from "@/features/editorDownload";

import { EditorHeader } from "@/widgets/editorHeader";
import { EditorToolbar } from "@/widgets/editorToolbar";
import { EditorPagesSidebar } from "@/widgets/editorPagesSidebar";
import { EditorRightRail } from "@/widgets/editorRightRail";
import { EditorBottomBar } from "@/widgets/editorBottomBar";

// Never trap the user behind the loader if a readiness signal never arrives.
const LOADER_MAX_DURATION_MS = 45000;

const EditorShellInner: React.FC = () => {
  const { t } = useTranslation();
  const {
    isDocumentLoading,
    isDocumentLoaded,
    isInitialThumbnailsRendered,
    isMergeOpen,
  } = useEditor();

  // Block interaction until the PDF is loaded AND its thumbnails have rendered
  // (the SDK hides the canvas while capturing them). The merge funnel shows the
  // merge window over an empty canvas, so the loader must not cover it.
  const baseLoader =
    !isMergeOpen &&
    (isDocumentLoading || (isDocumentLoaded && !isInitialThumbnailsRendered));

  const [loaderExpired, setLoaderExpired] = useState(false);

  useEffect(() => {
    if (!baseLoader) {
      setLoaderExpired(false);

      return;
    }

    const timeoutId = window.setTimeout(
      () => setLoaderExpired(true),
      LOADER_MAX_DURATION_MS
    );

    return () => window.clearTimeout(timeoutId);
  }, [baseLoader]);

  const showLoader = baseLoader && !loaderExpired;

  // On small screens the pages sidebar and right rail are off-canvas drawers,
  // opened from the bottom bar. Desktop keeps them in-flow (drawer state unused).
  const [mobileDrawer, setMobileDrawer] = useState<
    "pages" | "properties" | null
  >(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMobileDrawer(null);
    };

    desktop.addEventListener("change", closeOnDesktop);

    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#2A2D33]">
      <EditorFunnelInit />
      <EditorHeader />
      <EditorToolbar />

      <div className="relative flex min-h-0 flex-1">
        {/* Pages sidebar — in-flow on desktop, left slide-in drawer on mobile. */}
        <div
          className={cn(
            "h-full shrink-0 transition-transform duration-200",
            "max-md:fixed max-md:start-0 max-md:top-0 max-md:z-40",
            mobileDrawer === "pages"
              ? "max-md:translate-x-0"
              : "max-md:-translate-x-full"
          )}
        >
          <EditorPagesSidebar />
        </div>

        <div className="relative flex min-w-0 flex-1">
          <PdfEditorCanvas />

          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-2">
            <EditorBottomBar
              onOpenPages={() => setMobileDrawer("pages")}
              onOpenProperties={() => setMobileDrawer("properties")}
            />
          </div>
        </div>

        {/* Right rail — in-flow on desktop, right slide-in drawer on mobile. */}
        <div
          className={cn(
            "h-full shrink-0 transition-transform duration-200",
            "max-md:fixed max-md:end-0 max-md:top-0 max-md:z-40",
            mobileDrawer === "properties"
              ? "max-md:translate-x-0"
              : "max-md:translate-x-full"
          )}
        >
          <EditorRightRail />
        </div>

        {/* Backdrop closes whichever drawer is open (mobile only). */}
        {mobileDrawer && (
          <button
            type="button"
            aria-label={String(t("editor_page.bottom_bar.close_panel"))}
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setMobileDrawer(null)}
          />
        )}
      </div>

      {showLoader && (
        <div
          role="status"
          aria-live="polite"
          aria-busy="true"
          className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-[#2A2D33]/90 backdrop-blur-sm"
        >
          <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/20 border-t-[#3B82F6]" />
          <span className="text-sm text-white/70">
            {String(t("editor_page.canvas.loading_document"))}
          </span>
        </div>
      )}

      <DownloadModal />
      <MergeWindow />
      <SplitPdfModal />
    </div>
  );
};

const hasDocumentSource = (): boolean => {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);

  return Boolean(params.get("docId"));
};

interface EditorShellProps {
  readonly locale?: ELanguages;
}

export const EditorShell: React.FC<EditorShellProps> = ({
  locale = defaultLocale,
}) => {
  const storedFilename = useDocumentsStore.use.filename();
  const storedDocumentId = useDocumentsStore.use.documentId();
  const pdfFileContent = useDocumentsStore.use.pdfFileContent();
  const [hasHandoff, setHasHandoff] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void peekEditorHandoffPdf().then((pdf) => {
      if (!cancelled) setHasHandoff(Boolean(pdf));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const pendingDocument = Boolean(
    hasHandoff || pdfFileContent || storedDocumentId || hasDocumentSource()
  );

  const [initialFilename, setInitialFilename] = useState<string>(
    pendingDocument && storedFilename ? storedFilename : ""
  );

  useEffect(() => {
    if (pendingDocument && storedFilename) {
      setInitialFilename(storedFilename);
    } else if (!pendingDocument) {
      setInitialFilename("");
    }
  }, [storedFilename, pendingDocument]);

  return (
    <EditorProvider initialFilename={initialFilename} locale={locale}>
      <EditorShellInner />
    </EditorProvider>
  );
};
