import { createPortal } from "react-dom";
import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type FC,
  type ReactNode,
  type ReactElement,
} from "react";

import { cn } from "@/shared/lib/utils/cn";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

const DEFAULT_OFFSET = 10;

const arrowByPlacement: Record<TooltipPlacement, string> = {
  bottom:
    "before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-x-[6px] before:border-x-transparent before:border-b-[6px] before:border-b-[rgba(0,0,0,0.8)]",
  top: "before:top-full before:left-1/2 before:-translate-x-1/2 before:border-x-[6px] before:border-x-transparent before:border-t-[6px] before:border-t-[rgba(0,0,0,0.8)]",
  right:
    "before:end-full before:top-1/2 before:-translate-y-1/2 before:border-y-[6px] before:border-y-transparent before:border-e-[6px] before:border-e-[rgba(0,0,0,0.8)]",
  left: "before:start-full before:top-1/2 before:-translate-y-1/2 before:border-y-[6px] before:border-y-transparent before:border-s-[6px] before:border-s-[rgba(0,0,0,0.8)]",
};

interface TooltipProps {
  content: ReactNode;
  placement?: TooltipPlacement;
  children: ReactElement;
  delay?: number;
  offset?: number;
}

function getPosition(
  anchor: DOMRect,
  tooltip: DOMRect,
  placement: TooltipPlacement,
  offset: number
): { top: number; left: number } {
  switch (placement) {
    case "top":
      return {
        top: anchor.top - tooltip.height - offset,
        left: anchor.left + anchor.width / 2 - tooltip.width / 2,
      };
    case "bottom":
      return {
        top: anchor.bottom + offset,
        left: anchor.left + anchor.width / 2 - tooltip.width / 2,
      };
    case "left":
      return {
        top: anchor.top + anchor.height / 2 - tooltip.height / 2,
        left: anchor.left - tooltip.width - offset,
      };
    case "right":
      return {
        top: anchor.top + anchor.height / 2 - tooltip.height / 2,
        left: anchor.right + offset,
      };
  }
}

export const Tooltip: FC<TooltipProps> = ({
  content,
  placement = "bottom",
  children,
  delay = 0,
  offset = DEFAULT_OFFSET,
}) => {
  const anchorRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null
  );

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    setVisible(false);
    setCoords(null);
  }, []);

  useEffect(() => {
    if (!visible || !anchorRef.current || !tooltipRef.current) return;

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    setCoords(getPosition(anchorRect, tooltipRect, placement, offset));
  }, [visible, placement, offset]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <>
      <span
        ref={anchorRef as React.RefObject<HTMLSpanElement>}
        onMouseEnter={show}
        onMouseLeave={hide}
        onMouseDown={hide}
        className="inline-flex"
      >
        {children}
      </span>
      {visible &&
        content &&
        createPortal(
          <div
            ref={tooltipRef}
            className={cn(
              "pointer-events-none fixed z-[9999] before:absolute before:border-solid before:content-['']",
              arrowByPlacement[placement]
            )}
            style={
              coords
                ? { top: coords.top, left: coords.left }
                : { visibility: "hidden" }
            }
          >
            <div className="rounded-md bg-[rgba(0,0,0,0.8)] p-2 text-center font-[Outfit,sans-serif] text-[13px] leading-4 font-normal tracking-[0.26px] whitespace-nowrap text-white backdrop-blur-[60px]">
              {content}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
