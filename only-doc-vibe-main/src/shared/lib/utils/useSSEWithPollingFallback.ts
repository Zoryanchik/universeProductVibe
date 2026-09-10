import { useCallback, useEffect, useRef, useState } from "react";

import { SSEEventBus } from "../../api/sse/sseEventBus";
import type { SSESubscriptionEventsMap } from "../../api/sse/types";
import type { ESSEventType } from "../../api/sse/sse-event-type";
import { useEventBusSubscription } from "../state/useEventBusSubscription";
import {
  useLongPolling,
  type Poller,
  type UseLongPollingOptions,
} from "./useLongPolling";
import useEventCallback from "../state/useEventCallback";

interface UseSSEWithPollingFallbackOptions<T extends ESSEventType> {
  poller: Poller;
  pollingOptions: UseLongPollingOptions;
  sseEvent: T;
  sseWaitTimeoutMs: number;
  shouldHandleSSEEvent?: (data: SSESubscriptionEventsMap[T]) => boolean;
  onSSEEvent: (data: SSESubscriptionEventsMap[T]) => void;
}

export const useSSEWithPollingFallback = <T extends ESSEventType>({
  poller,
  pollingOptions,
  sseEvent,
  sseWaitTimeoutMs,
  shouldHandleSSEEvent,
  onSSEEvent,
}: UseSSEWithPollingFallbackOptions<T>) => {
  const hasGotSSEEventRef = useRef(false);
  const sseEventTimeoutRef = useRef<number | null>(null);
  const [isWaitingSSEEvent, setIsWaitingSSEEvent] = useState(false);

  const { startPolling, isPollingRef, stopPolling, isPolling } = useLongPolling(
    useEventCallback(async (signal) => {
      await poller(signal);
      setIsWaitingSSEEvent(false);
    }),
    {
      ...pollingOptions,
      onTimedOut: () => {
        setIsWaitingSSEEvent(false);

        pollingOptions.onTimedOut?.();
      },
      onMaxRetriesReached: () => {
        setIsWaitingSSEEvent(false);

        pollingOptions.onMaxRetriesReached?.();
      },
    }
  );

  useEventBusSubscription(SSEEventBus, sseEvent, (data: unknown) => {
    if (!isWaitingSSEEvent) return;

    const typedData = data as SSESubscriptionEventsMap[T];

    if (shouldHandleSSEEvent && !shouldHandleSSEEvent(typedData)) {
      return;
    }

    hasGotSSEEventRef.current = true;

    onSSEEvent(typedData);
    stopPolling();
  });

  const startWaitingSSEEvent = useCallback(() => {
    setIsWaitingSSEEvent(true);
    hasGotSSEEventRef.current = false;

    sseEventTimeoutRef.current = window.setTimeout(() => {
      if (hasGotSSEEventRef.current) return;

      startPolling();
    }, sseWaitTimeoutMs);
  }, [startPolling, sseWaitTimeoutMs]);

  useEffect(() => {
    return () => {
      if (sseEventTimeoutRef.current) {
        clearTimeout(sseEventTimeoutRef.current);
      }
    };
  }, []);

  return {
    startWaitingSSEEvent,
    startPolling,
    stopPolling,
    isPollingRef,
    isPolling,
    isWaitingSSEEvent,
    isLoading: isWaitingSSEEvent || isPolling,
  };
};
