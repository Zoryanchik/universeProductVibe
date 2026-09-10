import type Konva from "konva";
import type { StoreType } from "polotno/model/store";

import { isMobileDevice } from "@/shared/lib/device/is-mobile";

import { useEditorStage } from "./useEditorStage";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

/**
 * Polotno's table element wires cell focus to Konva `onClick` and cell editing to
 * `onDblClick`. Those are mouse-only events: on touch devices Konva fires
 * `tap`/`dbltap` instead, so table cells are unreachable — you can't focus a cell
 * (needed to add/remove rows & columns) or double-tap to edit its text. We bridge
 * the gap by forwarding stage-level taps to the currently selected table's existing
 * handlers, which reuses Polotno's own cell hit-testing. We only act when a table is
 * selected, so taps on text or other elements are left untouched.
 */
export const useTableTouchBridge = (store: StoreType) => {
  useEditorStage((stage) => {
    const getSelectedTableNode = () => {
      const table = (store.selectedElements as unknown as AnyElement[]).find(
        (el) => el?.type === "table"
      );
      if (!table) return null;

      return stage.findOne(`#${table.id}`) ?? null;
    };

    const handleTap = (e: Konva.KonvaEventObject<TouchEvent>) => {
      getSelectedTableNode()?.fire("click", e, false);
    };

    const handleDblTap = (e: Konva.KonvaEventObject<TouchEvent>) => {
      getSelectedTableNode()?.fire("dblclick", e, false);
    };

    stage.on("tap.tableBridge", handleTap);
    stage.on("dbltap.tableBridge", handleDblTap);

    return () => {
      stage.off("tap.tableBridge");
      stage.off("dbltap.tableBridge");
    };
  }, isMobileDevice());
};
