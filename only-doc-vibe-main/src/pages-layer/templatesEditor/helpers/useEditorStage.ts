import { useEffect, useRef } from "react";
import Konva from "konva";

const MAX_ATTACH_ATTEMPTS = 60;

type StageAttach = (stage: Konva.Stage) => void | (() => void);

/**
 * Resolves the editor's Konva stage and runs `onAttach` once it's available. The
 * stage mounts asynchronously with the canvas, so we retry across animation frames
 * until it appears (single-editor assumption: fall back to the first stage). The
 * cleanup function returned by `onAttach` runs on unmount. Centralizes the
 * find/retry/cleanup plumbing shared by the canvas gesture hooks.
 */
export const useEditorStage = (onAttach: StageAttach, enabled = true) => {
  const onAttachRef = useRef(onAttach);
  onAttachRef.current = onAttach;

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let detach: void | (() => void);
    let attempts = 0;

    const attach = () => {
      if (cancelled) return;

      const stage =
        Konva.stages.find((s) =>
          s.container()?.closest(".polotno-workspace-inner")
        ) ?? Konva.stages[0];

      if (!stage) {
        if (attempts++ < MAX_ATTACH_ATTEMPTS) requestAnimationFrame(attach);

        return;
      }

      detach = onAttachRef.current(stage);
    };

    attach();

    return () => {
      cancelled = true;
      detach?.();
    };
  }, [enabled]);
};
