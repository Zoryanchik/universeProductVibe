import React, {
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
  useEffect,
  type FC,
} from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";

import { IconButton } from "../../../../../ui/IconButton";
import { Tooltip } from "../../../../../ui/Tooltip";
import { ToolbarPopover } from "../../../../../ui/ToolbarPopover";
import { OptionItem } from "../../../../../components/OptionItem";
import { useLockElements } from "../../../../../helpers/lockElements";
import { ToolbarItem } from "./ToolbarItem";

export { ToolbarItem } from "./ToolbarItem";

const GAP = 8;
const MORE_BUTTON_WIDTH = 40;

function calcVisibleCount(
  childWidths: number[],
  containerWidth: number
): number {
  const totalWidth = childWidths.reduce(
    (sum, w, i) => sum + w + (i > 0 ? GAP : 0),
    0
  );

  if (totalWidth <= containerWidth) return childWidths.length;

  const availableWidth = containerWidth - MORE_BUTTON_WIDTH - GAP;
  let width = 0;

  for (let i = 0; i < childWidths.length; i++) {
    width += childWidths[i] + (i > 0 ? GAP : 0);
    if (width > availableWidth) {
      return Math.max(1, i);
    }
  }

  return childWidths.length;
}

interface LeftGroupProps {
  store: StoreType;
  children?: React.ReactNode;
}

export const LeftGroup: FC<LeftGroupProps> = observer(({ store, children }) => {
  const { t } = useTranslation();
  const { isLocked } = useLockElements({ store });
  const containerRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLSpanElement>(null);
  const hiddenRef = useRef<HTMLDivElement>(null);
  const childWidthsRef = useRef<number[]>([]);
  const [visibleCount, setVisibleCount] = useState<number | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);

  const childArray = React.Children.toArray(children);
  const childCount = childArray.length;

  useEffect(() => {
    setVisibleCount(null);
    setMoreOpen(false);
  }, [childCount]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || isLocked || childCount === 0) return;

    if (visibleCount === null) {
      container.style.overflow = "hidden";

      const elements = Array.from(container.children) as HTMLElement[];
      childWidthsRef.current = elements.map(
        (el) => el.getBoundingClientRect().width
      );

      const containerWidth = container.getBoundingClientRect().width;
      const vc = calcVisibleCount(childWidthsRef.current, containerWidth);

      container.style.overflow = "";
      setVisibleCount(vc);

      return;
    }

    const handleResize = () => {
      container.style.overflow = "hidden";
      const containerWidth = container.getBoundingClientRect().width;
      container.style.overflow = "";
      const vc = calcVisibleCount(childWidthsRef.current, containerWidth);
      setVisibleCount((prev) => (prev === vc ? prev : vc));
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [visibleCount, childCount, isLocked]);

  const handleMoreToggle = useCallback(() => {
    setMoreOpen((prev) => !prev);
  }, []);

  const handleMoreClose = useCallback(() => {
    setMoreOpen(false);
  }, []);

  const handleMoreItemClick = useCallback((overflowIndex: number) => {
    setMoreOpen(false);

    setTimeout(() => {
      const container = hiddenRef.current;
      if (!container) return;

      const hiddenItems = Array.from(container.children);
      const targetItem = hiddenItems[overflowIndex];
      if (!targetItem) return;

      const button = targetItem.querySelector("button");
      if (button) button.click();
    }, 0);
  }, []);

  if (isLocked) {
    return (
      <div
        ref={containerRef}
        className="flex min-w-0 flex-1 items-center gap-2 [&>*]:shrink-0"
      />
    );
  }

  if (visibleCount === null) {
    return (
      <div
        ref={containerRef}
        className="flex min-w-0 flex-1 items-center gap-2 [&>*]:shrink-0"
      >
        {childArray}
      </div>
    );
  }

  const hasOverflow = visibleCount < childCount;
  const visibleChildren = childArray.slice(0, visibleCount);
  const overflowedChildren = hasOverflow ? childArray.slice(visibleCount) : [];

  const overflowedMeta = overflowedChildren
    .map((child, index) => {
      if (React.isValidElement(child) && child.type === ToolbarItem) {
        return {
          index,
          iconName: (child.props as { iconName: string }).iconName,
          label: (child.props as { label: string }).label,
        };
      }

      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div
      className="flex min-w-0 flex-1 items-center gap-2 [&>*]:shrink-0"
      ref={containerRef}
    >
      {visibleChildren}
      {hasOverflow && (
        <div className="relative inline-flex">
          <span ref={moreButtonRef} className="inline-flex">
            <Tooltip
              content={t("templatesEditor.toolbar.more_tools") as string}
            >
              <IconButton
                iconName="more_horiz"
                onClick={handleMoreToggle}
                active={moreOpen}
              />
            </Tooltip>
          </span>
          <div
            ref={hiddenRef}
            className="pointer-events-none absolute start-0 top-0 opacity-0 [&>*]:absolute [&>*]:start-0 [&>*]:top-0"
          >
            {overflowedChildren}
          </div>
          <ToolbarPopover
            label={t("templatesEditor.toolbar.more_tools") as string}
            isOpen={moreOpen}
            onClose={handleMoreClose}
            anchorRef={moreButtonRef}
          >
            <div className="grid grid-cols-2 gap-1">
              {overflowedMeta.map((meta) => (
                <OptionItem
                  key={meta.label}
                  iconName={meta.iconName}
                  label={meta.label}
                  onClick={() => handleMoreItemClick(meta.index)}
                />
              ))}
            </div>
          </ToolbarPopover>
        </div>
      )}
    </div>
  );
});
