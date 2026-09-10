import {
  useState,
  useEffect,
  useRef,
  memo,
  type FC,
  type ReactNode,
} from "react";

const observerEntryCallbacks = new WeakMap<
  Element,
  (isIntersecting: boolean) => void
>();
let sharedObserver: IntersectionObserver | null = null;

function getSharedObserver() {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          observerEntryCallbacks.get(entry.target)?.(entry.isIntersecting);
        }
      },
      { rootMargin: "600px 0px" }
    );
  }

  return sharedObserver;
}

export const LazySlot: FC<{ children: ReactNode }> = memo(({ children }) => {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = getSharedObserver();
    observerEntryCallbacks.set(el, setMounted);
    observer.observe(el);

    return () => {
      observer.unobserve(el);
      observerEntryCallbacks.delete(el);
    };
  }, []);

  return (
    <div ref={ref} className="aspect-square p-1 [contain:layout_style_paint]">
      {mounted ? children : null}
    </div>
  );
});
