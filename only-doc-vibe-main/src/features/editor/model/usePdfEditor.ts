import { useEffect, useRef, useState } from "react";

import { applyEditorViewportTheme, callSdk } from "./sdkBindings";
import { patchMaterialSdk } from "./materialSdkPatch";
import type { PDFEditorConfig, PDFEditorInstance } from "./types";

interface UsePdfEditorOptions {
  onReady?: (instance: PDFEditorInstance) => void;
  onExportRequested?: () => void;
  onDocumentLoaded?: () => void;
  onDocumentLoadError?: (error: unknown) => void;
}

export const usePdfEditor = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  documentUrl?: string,
  options?: UsePdfEditorOptions
) => {
  const editorRef = useRef<PDFEditorInstance | null>(null);
  const isReadyRef = useRef(false);
  const loadGenerationRef = useRef(0);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [isReady, setIsReady] = useState(false);

  // Initialize the SDK once for the lifetime of the container.
  useEffect(() => {
    if (!containerRef.current) return;

    if (editorRef.current) return;

    const SDKExport = window.PDFEditorSDK;
    const SDKConstructor =
      typeof SDKExport === "function"
        ? SDKExport
        : (
            SDKExport as {
              default?: new (config: PDFEditorConfig) => PDFEditorInstance;
            }
          )?.default;

    if (!SDKConstructor) {
      console.error(
        "[PdfEditor] PDFEditorSDK not found on window — ensure CDN scripts loaded before React hydration"
      );

      return;
    }

    const container = containerRef.current;

    const instance = new SDKConstructor({
      container,
      width: container.offsetWidth || 900,
      height: container.offsetHeight || 700,
      wasmUrl: "/pdf-editor-sdk/pdfcore.wasm",
      // Continuous scroll: all pages stacked in a native scroll column, each an
      // interactive canvas (pdfguru-style), instead of one page at a time.
      layout: "continuous",
      onReady: () => {
        isReadyRef.current = true;
        setIsReady(true);
        optionsRef.current?.onReady?.(instance);
      },
      onError: (error: Error) => {
        console.error("[PdfEditor]", error);
        optionsRef.current?.onDocumentLoadError?.(error);
      },
    });

    editorRef.current = instance;
    patchMaterialSdk(instance);

    // Intercept the SDK's built-in Export button so we can show our own modal.
    const handleClickCapture = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const exportTrigger = target.closest<HTMLElement>(
        '[data-export-trigger], [class*="export" i] button, button[class*="export" i]'
      );
      if (!exportTrigger) return;

      const label = (exportTrigger.textContent || "").trim().toLowerCase();
      if (!label.includes("export") && !exportTrigger.dataset.exportTrigger) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      optionsRef.current?.onExportRequested?.();
    };

    container.addEventListener("click", handleClickCapture, true);

    return () => {
      container.removeEventListener("click", handleClickCapture, true);
      try {
        editorRef.current?.destroy();
      } catch (err) {
        console.warn("[PdfEditor] destroy failed", err);
      }
      editorRef.current = null;
      isReadyRef.current = false;
      setIsReady(false);
    };
  }, [containerRef]);

  useEffect(() => {
    if (!documentUrl) return;

    if (!isReady) return;

    const instance = editorRef.current;
    if (!instance) return;

    const loadGeneration = ++loadGenerationRef.current;

    (async () => {
      try {
        await instance.loadPDF(documentUrl);
        callSdk(instance, "lockWorkspaceObjects");
        applyEditorViewportTheme(instance);

        if (
          loadGeneration !== loadGenerationRef.current ||
          editorRef.current !== instance
        ) {
          return;
        }

        optionsRef.current?.onDocumentLoaded?.();
      } catch (err) {
        if (
          loadGeneration !== loadGenerationRef.current ||
          editorRef.current !== instance
        ) {
          return;
        }

        console.error("[PdfEditor] loadPDF failed", err);
        optionsRef.current?.onDocumentLoadError?.(err);
      }
    })();

    return () => {
      loadGenerationRef.current += 1;
    };
  }, [documentUrl, isReady]);

  return { editor: editorRef };
};
