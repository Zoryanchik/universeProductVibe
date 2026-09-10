import { useEffect } from "react";
import { reaction } from "mobx";
import type { StoreType } from "polotno/model/store";

import { useLockElements } from "./lockElements";

// Minimal shape of the page children we touch here. Polotno doesn't type the
// arbitrary `custom` metadata bag, so we describe just what we read/write.
interface PageChild {
  id: string;
  type: string;
  custom?: Record<string, unknown>;
  set: (props: { custom: Record<string, unknown> }) => void;
}

export const useMobileDrawMode = (
  store: StoreType,
  isDrawMode: boolean,
  sheetOpen: boolean
) => {
  const { checkIsLockedPage } = useLockElements({ store });
  const currentTool = store.tool;

  useEffect(() => {
    if (!isDrawMode) return;

    if (checkIsLockedPage()) return;

    store.selectElements([]);
    store.setTool("draw");
    store.setToolOptions({
      brushType: "brush",
      opacity: 1,
      strokeWidth: store.toolOptions.strokeWidth || 5,
    });

    return () => {
      store.setTool("selection");
    };
  }, [isDrawMode, store, checkIsLockedPage]);

  // Once the config panel is closed, the compact bar means "always drawing": if the
  // tool drifts (selecting a stroke, undo/redo, the panel's Selection tab, etc.),
  // restore the draw tool so the canvas keeps responding.
  useEffect(() => {
    if (isDrawMode && !sheetOpen && currentTool !== "draw") {
      store.selectElements([]);
      store.setTool("draw");
    }
  }, [isDrawMode, sheetOpen, currentTool, store]);

  // Bound to the page that was active when draw mode started, so switching pages
  // can't mis-tag pre-existing artwork on another page as a user stroke. Strokes are
  // only ever appended, so observing the children count is enough to spot new ones.
  useEffect(() => {
    if (!isDrawMode) return;

    const page = store.activePage;
    if (!page) return;

    const getChildren = () => (page.children ?? []) as unknown as PageChild[];
    const seen = new Set<string>(getChildren().map((el) => el.id));

    return reaction(
      () => page.children.length,
      () => {
        getChildren().forEach((el) => {
          if (seen.has(el.id)) return;

          seen.add(el.id);
          if (el.type === "svg")
            el.set({ custom: { ...(el.custom ?? {}), isDrawing: true } });
        });
      }
    );
  }, [isDrawMode, store]);
};
