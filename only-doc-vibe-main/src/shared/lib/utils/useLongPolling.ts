import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

import useEventCallback from "../state/useEventCallback";

export type Poller = (signal?: AbortSignal) => Promise<void>;

export interface UseLongPollingOptions {
  intervalMs?: number;
  immediate?: boolean;
  onError?: (error: unknown) => void;
  stopTimeoutMs?: number;
  onTimedOut?: () => void;
  maxRetries?: number;
  onMaxRetriesReached?: () => void;
}

interface UseLongPollingResult {
  startPolling: () => void;
  isPolling: boolean;
  stopPolling: () => void;
  isPollingRef: RefObject<boolean>;
}

export const useLongPolling = (
  poller: Poller,
  {
    intervalMs = 5_000,
    immediate = true,
    onError,
    stopTimeoutMs = 30_000,
    onTimedOut,
    maxRetries,
    onMaxRetriesReached,
  }: UseLongPollingOptions = {}
): UseLongPollingResult => {
  const [isPolling, setIsPolling] = useState(false);

  const activeRef = useRef(false);
  const timeoutIdRef = useRef<number | null>(null);
  const stopTimeoutIdRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isRunningRef = useRef(false);
  const retriesRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    if (stopTimeoutIdRef.current !== null) {
      clearTimeout(stopTimeoutIdRef.current);
      stopTimeoutIdRef.current = null;
    }
  }, []);

  const scheduleNext = useCallback(() => {
    if (!activeRef.current) return;

    timeoutIdRef.current = window.setTimeout(() => {
      void runOnce();
    }, intervalMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]);

  const handleError = useEventCallback((error: unknown) => {
    if (onError) onError(error);

    // Continue scheduling even after errors, unless stopped
    scheduleNext();
  });

  const runOnce = useEventCallback(async () => {
    if (!activeRef.current || isRunningRef.current) return;

    isRunningRef.current = true;

    const controller = new AbortController();
    abortControllerRef.current = controller;
    retriesRef.current++;

    try {
      await poller(controller.signal);

      stopPolling();
    } catch (error) {
      if (maxRetries && retriesRef.current >= maxRetries) {
        onMaxRetriesReached?.();
        stopPolling();
      }

      handleError(error);
    } finally {
      isRunningRef.current = false;
    }
  });

  const stopPolling = useCallback(() => {
    activeRef.current = false;
    setIsPolling(false);
    clearTimer();
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    retriesRef.current = 0;
  }, [clearTimer]);

  const startPolling = useCallback(() => {
    if (activeRef.current) return;

    activeRef.current = true;
    setIsPolling(true);

    stopTimeoutIdRef.current = window.setTimeout(() => {
      onTimedOut?.();
      stopPolling();
    }, stopTimeoutMs);

    if (immediate) {
      void runOnce();
    } else {
      scheduleNext();
    }
  }, [
    immediate,
    runOnce,
    scheduleNext,
    stopTimeoutMs,
    onTimedOut,
    stopPolling,
  ]);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return { startPolling, isPolling, stopPolling, isPollingRef: activeRef };
};
