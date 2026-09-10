import { useEffect, useState } from "react";

import type { PDFEditorInstance } from "./types";
import { callSdk, getCurrentPageFromStore, getEditorZoom } from "./sdkBindings";

export interface EditorRuntimeState {
  pageCount: number;
  currentPage: number;
  zoom: number;
}

const POLL_INTERVAL_MS = 400;

export const useEditorState = (
  instance: PDFEditorInstance | null
): EditorRuntimeState => {
  const [state, setState] = useState<EditorRuntimeState>({
    pageCount: 0,
    currentPage: 1,
    zoom: 1,
  });

  useEffect(() => {
    if (!instance) return;

    let cancelled = false;

    const read = () => {
      if (cancelled) return;

      const pageCount = callSdk<number>(instance, "getPageCount") ?? 0;
      const zoom = getEditorZoom(instance);
      const currentPage = getCurrentPageFromStore(instance);

      setState((prev) => {
        if (
          prev.pageCount === pageCount &&
          prev.zoom === zoom &&
          prev.currentPage === currentPage
        ) {
          return prev;
        }

        return { ...prev, pageCount, zoom, currentPage };
      });
    };

    read();
    const interval = window.setInterval(read, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [instance]);

  return state;
};

export const useEditorCurrentPage = (
  instance: PDFEditorInstance | null,
  setCurrentPage: (page: number) => void
) => {
  useEffect(() => {
    if (!instance) return;

    const observer = new MutationObserver(() => {
      const indicator = document.querySelector<HTMLElement>(
        ".pdf-editor-scope [data-current-page], .pdf-editor-scope .current-page"
      );
      if (!indicator) return;

      const parsed = Number.parseInt(indicator.textContent || "", 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        setCurrentPage(parsed);
      }
    });

    const scope = document.querySelector(".pdf-editor-scope");
    if (scope) {
      observer.observe(scope, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => observer.disconnect();
  }, [instance, setCurrentPage]);
};
