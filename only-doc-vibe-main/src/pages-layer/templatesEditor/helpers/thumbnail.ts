import { onSnapshot } from "mobx-state-tree";
import type { StoreType } from "polotno/model/store";
import type { PageType } from "polotno/model/page-model";
import { useEffect, useRef, useState } from "react";

const THUMBNAIL_PIXEL_RATIO = 1;
const DEBOUNCE_MS = 300;
const THROTTLE_MS = 6000;

interface QueueItem {
  pageId: string;
  store: StoreType;
  resolve: (url: string) => void;
}

let queue: QueueItem[] = [];
let processing = false;

async function processQueue() {
  if (processing || queue.length === 0) return;

  processing = true;

  const item = queue.shift()!;
  try {
    const url = await item.store.toDataURL({
      pageId: item.pageId,
      pixelRatio: THUMBNAIL_PIXEL_RATIO,
    });
    item.resolve(url);
  } catch {
    // skip failed renders silently — keeps queue moving
  }

  processing = false;
  processQueue();
}

function enqueueThumbnailRender(
  pageId: string,
  store: StoreType,
  resolve: (url: string) => void
) {
  queue = queue.filter((item) => item.pageId !== pageId);
  queue.push({ pageId, store, resolve });
  processQueue();
}

function removePendingRenders(pageId: string) {
  queue = queue.filter((item) => item.pageId !== pageId);
}

export function useThumbnail(page: PageType, store: StoreType) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;
    let lastRenderTime = 0;

    const regenerate = () => {
      enqueueThumbnailRender(page.id, store, setThumbnail);
    };

    const scheduleRegenerate = () => {
      if (debounceTimer) clearTimeout(debounceTimer);

      if (!isVisibleRef.current) return;

      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          if (Date.now() - lastRenderTime >= THROTTLE_MS) {
            regenerate();
            lastRenderTime = Date.now();
          }

          throttleTimer = null;
        }, THROTTLE_MS);
      }

      debounceTimer = setTimeout(() => {
        regenerate();
        lastRenderTime = Date.now();
        debounceTimer = null;
        if (throttleTimer) {
          clearTimeout(throttleTimer);
          throttleTimer = null;
        }
      }, DEBOUNCE_MS);
    };

    let prevSnapshot: unknown = null;
    const disposeSnapshot = onSnapshot(page, (snapshot: unknown) => {
      if (JSON.stringify(prevSnapshot) !== JSON.stringify(snapshot)) {
        scheduleRegenerate();
        prevSnapshot = snapshot;
      }
    });

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisibleRef.current = true;
            scheduleRegenerate();
          } else {
            if (debounceTimer) clearTimeout(debounceTimer);

            if (throttleTimer) clearTimeout(throttleTimer);

            isVisibleRef.current = false;
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      intersectionObserver.observe(containerRef.current);
    } else {
      isVisibleRef.current = true;
      scheduleRegenerate();
    }

    return () => {
      intersectionObserver.disconnect();
      if (debounceTimer) clearTimeout(debounceTimer);

      if (throttleTimer) clearTimeout(throttleTimer);

      disposeSnapshot();
      removePendingRenders(page.id);
    };
  }, [page, store]);

  return { thumbnail, containerRef };
}
