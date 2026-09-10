import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
  type UIEventHandler,
  type Ref,
} from "react";

import { cn } from "@/shared/lib/utils/cn";

const MIN_THUMB_HEIGHT = 30;

export const ScrollAreaViewport = forwardRef<
  HTMLDivElement,
  { children: ReactNode; onScroll?: UIEventHandler<HTMLDivElement> }
>(({ children, onScroll }, ref) => (
  <div
    ref={ref}
    onScroll={onScroll}
    className="custom-scroll-area-viewport box-border min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
  >
    {children}
  </div>
));

ScrollAreaViewport.displayName = "ScrollAreaViewport";

interface CustomScrollAreaProps {
  children: ReactNode;
  className?: string;
  onScroll?: UIEventHandler<HTMLDivElement>;
  viewportRef?: Ref<HTMLDivElement>;
}

export const CustomScrollArea = forwardRef<
  HTMLDivElement,
  CustomScrollAreaProps
>(
  (
    {
      children,
      className,
      onScroll: onScrollProp,
      viewportRef: externalViewportRef,
    },
    forwardedRef
  ) => {
    const viewportRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | undefined>(undefined);
    const dragCleanupRef = useRef<(() => void) | null>(null);

    const isDraggingRef = useRef(false);

    const [isOverflowing, setIsOverflowing] = useState(false);
    const [thumbStyle, setThumbStyle] = useState({ height: 0, y: 0 });

    const updateThumb = useCallback(() => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!viewport || !track) return;

      const { scrollHeight, clientHeight, scrollTop } = viewport;
      const overflows = scrollHeight > clientHeight + 1;

      setIsOverflowing(overflows);

      if (!overflows) return;

      const trackHeight = track.clientHeight;
      const ratio = clientHeight / scrollHeight;
      const height = Math.max(MIN_THUMB_HEIGHT, ratio * trackHeight);
      const maxTop = trackHeight - height;
      const scrollableDistance = scrollHeight - clientHeight;
      const y =
        scrollableDistance > 0 ? (scrollTop / scrollableDistance) * maxTop : 0;

      setThumbStyle({ height, y });
    }, []);

    const onScrollPropRef = useRef(onScrollProp);
    onScrollPropRef.current = onScrollProp;

    const handleScroll = useCallback<UIEventHandler<HTMLDivElement>>(
      (e) => {
        onScrollPropRef.current?.(e);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);

        rafRef.current = requestAnimationFrame(updateThumb);
      },
      [updateThumb]
    );

    const setViewportRef = useCallback(
      (el: HTMLDivElement | null) => {
        (viewportRef as React.MutableRefObject<HTMLDivElement | null>).current =
          el;
        if (!externalViewportRef) return;

        if (typeof externalViewportRef === "function") externalViewportRef(el);
        else
          (
            externalViewportRef as React.MutableRefObject<HTMLDivElement | null>
          ).current = el;
      },
      [externalViewportRef]
    );

    const handleThumbMouseDown = useCallback(
      (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const viewport = viewportRef.current;
        const track = trackRef.current;
        if (!viewport || !track) return;

        isDraggingRef.current = true;

        const startY = e.clientY;
        const startScrollTop = viewport.scrollTop;
        const trackHeight = track.clientHeight;
        const currentThumbHeight = thumbStyle.height;
        const maxScrollTop = viewport.scrollHeight - viewport.clientHeight;
        const maxThumbTop = trackHeight - currentThumbHeight;

        const onMouseMove = (ev: globalThis.MouseEvent) => {
          const deltaY = ev.clientY - startY;
          const scrollDelta =
            maxThumbTop > 0 ? (deltaY / maxThumbTop) * maxScrollTop : 0;
          viewport.scrollTop = Math.max(
            0,
            Math.min(maxScrollTop, startScrollTop + scrollDelta)
          );
        };

        const cleanup = () => {
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
          document.body.style.userSelect = "";
          dragCleanupRef.current = null;
        };

        const onMouseUp = () => {
          isDraggingRef.current = false;
          cleanup();
        };

        dragCleanupRef.current = cleanup;
        document.body.style.userSelect = "none";
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      },
      [thumbStyle.height]
    );

    useEffect(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const resizeObserver = new ResizeObserver(() => updateThumb());
      resizeObserver.observe(viewport);

      const mutationObserver = new MutationObserver(() => {
        requestAnimationFrame(updateThumb);
      });
      mutationObserver.observe(viewport, { childList: true, subtree: true });

      updateThumb();

      return () => {
        resizeObserver.disconnect();
        mutationObserver.disconnect();
        if (rafRef.current) cancelAnimationFrame(rafRef.current);

        dragCleanupRef.current?.();
      };
    }, [updateThumb]);

    return (
      <div
        ref={forwardedRef}
        className={cn(
          "custom-scroll-area relative flex flex-col overflow-hidden",
          className
        )}
      >
        <ScrollAreaViewport ref={setViewportRef} onScroll={handleScroll}>
          {children}
        </ScrollAreaViewport>
        <div
          ref={trackRef}
          className={cn(
            "custom-scroll-area-track ease pointer-events-none absolute end-[2px] top-[2px] bottom-[2px] z-[2] w-[6px] transition-opacity duration-[250ms]",
            isOverflowing ? "opacity-100" : "opacity-0"
          )}
        >
          <div
            ref={thumbRef}
            style={{
              height: thumbStyle.height,
              transform: `translateY(${thumbStyle.y}px)`,
            }}
            onMouseDown={handleThumbMouseDown}
            className="pointer-events-auto absolute start-0 top-0 w-full cursor-pointer rounded bg-[rgba(0,0,0,0.6)] will-change-transform hover:bg-[rgba(0,0,0,0.72)] active:bg-[rgba(0,0,0,0.8)]"
          />
        </div>
      </div>
    );
  }
);

CustomScrollArea.displayName = "CustomScrollArea";
