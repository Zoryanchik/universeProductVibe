import { useEffect, useRef } from "react";

import {
  clearFunnel,
  getEditorFunnelAction,
  hasMergeHandoff,
} from "@/entities/documents";
import { useDocumentsStore } from "@/entities/documents";

import { useEditorActions } from "./useEditorActions";
import { useEditor } from "./EditorContext";

export const EditorFunnelInit: React.FC = () => {
  const funnel = useDocumentsStore.use.funnel();
  const {
    isDocumentLoaded,
    isInitialThumbnailsRendered,
    openSplit,
    openTool,
    setHandActive,
    openMerge,
  } = useEditor();
  const actions = useEditorActions();
  const initializedRef = useRef(false);
  const mergeInitializedRef = useRef(false);

  useEffect(() => {
    if (!isDocumentLoaded) {
      initializedRef.current = false;
    }
  }, [isDocumentLoaded]);

  // The merge funnel has no loaded document on entry — the merge window opens
  // with the handed-off files, so this branch must not wait for the canvas.
  useEffect(() => {
    if (mergeInitializedRef.current || !funnel) return;

    if (getEditorFunnelAction(funnel) !== "merge") return;

    let cancelled = false;

    void hasMergeHandoff().then((exists) => {
      if (cancelled || !exists || mergeInitializedRef.current) return;

      mergeInitializedRef.current = true;
      openMerge({ mode: "funnel" });
    });

    return () => {
      cancelled = true;
    };
  }, [funnel, openMerge]);

  useEffect(() => {
    // Wait for the thumbnails too: the SDK hides the canvas while rendering
    // them, so opening the tool (e.g. signature) any earlier surfaces it over a
    // non-interactive page.
    if (
      !isDocumentLoaded ||
      !isInitialThumbnailsRendered ||
      !funnel ||
      initializedRef.current
    ) {
      return;
    }

    const action = getEditorFunnelAction(funnel);
    if (!action) return;

    initializedRef.current = true;

    if (action === "split") {
      openSplit();
    }

    if (action === "signature") {
      openTool("signature");
    }

    if (action === "hand") {
      setHandActive(true);
      actions.toggleHand(true);
    }

    // The funnel intent is one-time: clear it so a page reload does not
    // re-open the tool on an already-loaded document.
    clearFunnel();
  }, [
    actions,
    funnel,
    isDocumentLoaded,
    isInitialThumbnailsRendered,
    openSplit,
    openTool,
    setHandActive,
  ]);

  return null;
};
