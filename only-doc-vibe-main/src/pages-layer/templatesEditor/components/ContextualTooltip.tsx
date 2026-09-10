import { Html } from "react-konva-utils";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";
import type { PageType } from "polotno/model/page-model";
import { getTotalClientRect } from "polotno/utils/math";
import {
  type FC,
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
  createContext,
  useContext,
} from "react";

import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../ui/IconButton";
import { useLockElements } from "../helpers/lockElements";
import { Tooltip } from "../ui/Tooltip";
import { PositionInstrument } from "../modules/toolbarController/toolbars/common/instruments/Position";
import { CopyInstrument } from "../modules/toolbarController/toolbars/common/instruments/Copy";
import { DeleteInstrument } from "../modules/toolbarController/toolbars/common/instruments/Delete";
import { LockInstrument } from "../modules/toolbarController/toolbars/common/instruments/Lock";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

type PlacementSide = "top" | "bottom";

const PlacementContext = createContext<PlacementSide>("top");

interface ContextualTooltipProps {
  store: StoreType;
  page: PageType;
  stageRef?: AnyElement;
  components?: AnyElement;
  tooltipSafeArea?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}

const ToolbarContent: FC<{ store: StoreType }> = observer(({ store }) => {
  const { t } = useTranslation();
  const { isLocked, elements } = useLockElements({ store });
  const tooltipPlacement = useContext(PlacementContext);

  const isGroup = elements.length === 1 && elements[0]?.type === "group";
  const isMultipleSelected = elements.length > 1;

  const handleGroup = useCallback(() => {
    const ids = elements.map((el: AnyElement) => el.id);
    store.groupElements(ids);
  }, [store, elements]);

  const handleUngroup = useCallback(() => {
    const ids = elements.map((el: AnyElement) => el.id);
    store.ungroupElements(ids);
  }, [store, elements]);

  if (elements.length === 0) return null;

  return (
    <div className="flex items-center rounded-[16px] bg-[var(--color-bg-white-bg)] shadow-[0px_6px_12px_0px_rgba(0,0,0,0.08),0px_8px_40px_0px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-2 p-[10px]">
        {!isLocked && (
          <>
            {isGroup && (
              <Tooltip
                content={t("templatesEditor.ui.ungroup") as string}
                placement={tooltipPlacement}
              >
                <IconButton
                  iconName="ungroup"
                  onClick={handleUngroup}
                  disabled={isLocked}
                />
              </Tooltip>
            )}
            {isMultipleSelected && (
              <Tooltip
                content={t("templatesEditor.ui.group") as string}
                placement={tooltipPlacement}
              >
                <IconButton
                  iconName="stack_group"
                  onClick={handleGroup}
                  disabled={isLocked}
                />
              </Tooltip>
            )}
            <PositionInstrument store={store} position={tooltipPlacement} />
            <CopyInstrument store={store} position={tooltipPlacement} />
          </>
        )}
        <LockInstrument store={store} position={tooltipPlacement} />
      </div>
      {!isLocked && (
        <>
          <div className="mx-[2px] w-px self-stretch bg-[var(--color-action-stroke)]" />
          <div className="flex items-center p-[10px]">
            <DeleteInstrument store={store} position={tooltipPlacement} />
          </div>
        </>
      )}
    </div>
  );
});

const OFFSET = 80;

export const ContextualTooltip: FC<ContextualTooltipProps> = observer(
  ({ store, page, stageRef, tooltipSafeArea }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [fit, setFit] = useState(true);
    const [needCalculate, setNeedCalculate] = useState(true);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const tokenRef = useRef(0);

    useEffect(() => {
      const stage = stageRef?.current;
      if (!stage) return;

      const onStart = () => setIsDragging(true);
      const onEnd = () => {
        setIsDragging(false);
        setNeedCalculate(true);
      };

      stage.on("dragstart", onStart);
      stage.on("dragend", onEnd);

      const transformer = stage.findOne("Transformer");
      transformer?.on("transformstart", onStart);
      transformer?.on("transformend", onEnd);

      return () => {
        stage.off("dragstart", onStart);
        stage.off("dragend", onEnd);
        transformer?.off("transformstart", onStart);
        transformer?.off("transformend", onEnd);
      };
    }, [stageRef]);

    const selectionKey = store.selectedElements
      .map((el: AnyElement) => el.id)
      .join(",");

    useEffect(() => {
      setFit(true);
      setNeedCalculate(true);
    }, [selectionKey]);

    useEffect(() => {
      const stage = stageRef?.current;
      if (!stage) return;

      const wsInner = stage.container()?.closest(".polotno-workspace-inner");
      if (!wsInner) return;

      const onScroll = () => setNeedCalculate(true);
      wsInner.addEventListener("scroll", onScroll, { passive: true });

      return () => wsInner.removeEventListener("scroll", onScroll);
    }, [stageRef]);

    useLayoutEffect(() => {
      if (!needCalculate) return;

      const token = ++tokenRef.current;

      const timer = setTimeout(() => {
        if (token !== tokenRef.current) return;

        const el = wrapperRef.current;
        const stage = stageRef?.current;
        if (!el || !stage) {
          setNeedCalculate(false);

          return;
        }

        const wsContainer = stage
          .container()
          ?.closest(".polotno-workspace-container");
        if (!wsContainer) {
          setNeedCalculate(false);

          return;
        }

        const n = el.getBoundingClientRect();
        const t = wsContainer.getBoundingClientRect();
        const safeTop = tooltipSafeArea?.top ?? 0;
        const safeBottom = tooltipSafeArea?.bottom ?? 0;

        if (fit && n.top - t.top < 20 + safeTop) {
          setFit(false);
        } else if (!fit && n.bottom - t.top - t.height > -20 - safeBottom) {
          setFit(true);
        }

        setNeedCalculate(false);
      }, 100);

      return () => clearTimeout(timer);
    }, [needCalculate, fit, stageRef, tooltipSafeArea]);

    const allOnPage = store.selectedShapes.every(
      (s: AnyElement) => s.page === page
    );
    const hasCropMode = store.selectedElements.some(
      (el: AnyElement) => el._cropModeEnabled
    );

    if (store.selectedShapes.length === 0) return null;

    if (isDragging) return null;

    if (!allOnPage) return null;

    if (store.activePage !== page) return null;

    if (hasCropMode) return null;

    const rect = getTotalClientRect(store.selectedShapes);

    return (
      <Html
        transformFunc={(transform) => {
          const cx = rect.x + rect.width / 2;
          const cy = fit
            ? rect.y * transform.scaleY - OFFSET
            : (rect.y + rect.height) * transform.scaleY + OFFSET;

          const stageContainer = stageRef?.current?.container();
          const workspaceContainer = stageContainer?.closest(
            ".polotno-workspace-container"
          );
          const stageBox = stageContainer?.getBoundingClientRect() || {
            left: 0,
            top: 0,
          };
          const wsBox = workspaceContainer?.getBoundingClientRect() || {
            left: 0,
            top: 0,
            width: Number.POSITIVE_INFINITY,
          };

          const offsetX = stageBox.left - wsBox.left;
          const offsetY = stageBox.top - wsBox.top;

          let x = offsetX + transform.x + cx * transform.scaleX;

          const toolbarWidth =
            wrapperRef.current?.getBoundingClientRect().width || 0;
          if (Number.isFinite(wsBox.width) && toolbarWidth > 0) {
            const minX = 8 + toolbarWidth / 2;
            const maxX = wsBox.width - 8 - toolbarWidth / 2;
            if (maxX >= minX) {
              x = Math.max(minX, Math.min(x, maxX));
            }
          }

          return {
            ...transform,
            x,
            y: offsetY + transform.y + cy,
            scaleX: 1,
            scaleY: 1,
          };
        }}
        parentNodeFunc={({ stage }) => {
          return (
            stage?.container()?.closest(".polotno-workspace-container") ||
            (stage?.container()?.parentNode as HTMLDivElement)
          );
        }}
        divProps={{
          style: {
            pointerEvents: "none",
            position: "absolute",
            zIndex: 9,
            visibility: needCalculate ? "hidden" : "visible",
          },
        }}
      >
        <div
          ref={wrapperRef}
          className="pointer-events-auto [transform:translate(-50%,-50%)]"
        >
          <PlacementContext.Provider value={fit ? "top" : "bottom"}>
            <ToolbarContent store={store} />
          </PlacementContext.Provider>
        </div>
      </Html>
    );
  }
);
