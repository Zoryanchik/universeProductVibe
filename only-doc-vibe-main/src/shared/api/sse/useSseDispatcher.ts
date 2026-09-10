import { useEffect } from "react";
import {
  REACT_APP_SSE_URL,
  REACT_APP_SSE_MAX_RECONNECTION_ATTEMPTS,
  REACT_APP_SSE_RECONNECTION_DELAY,
} from "astro:env/client";

import { useUserStore } from "@/entities/user";

import { logger } from "../../lib/utils/logger";
import { SSEEventBus } from "./sseEventBus";
import { ESSEventType, isSSEEventType } from "./sse-event-type";

// Module-level singleton — guarantees one EventSource per browser tab, no
// matter how many places mount `useSseDispatcher`.
let activeConnection: {
  source: EventSource;
  userId: string;
} | null = null;
let reconnectAttempts = 0;
let reconnectTimer: number | null = null;

interface SseEnvelope {
  type: string;
  userId?: string;
  data?: unknown;
}

const dispatch = (raw: string): void => {
  let message: SseEnvelope;
  try {
    message = JSON.parse(raw) as SseEnvelope;
  } catch (err) {
    logger.warn("[sse] failed to parse message", err, raw);

    return;
  }

  if (!message?.type || !isSSEEventType(message.type)) {
    return;
  }

  // Chat events were designed to carry only the inner `data` shape
  // (see `SSEChatStatusChangedEvent` / `SSEChatPreviewReadyEvent`).
  // Every other event type carries the full envelope.
  if (
    message.type === ESSEventType.CHAT_STATUS_CHANGED ||
    message.type === ESSEventType.CHAT_PREVIEW_READY
  ) {
    SSEEventBus.emit(message.type, message.data as never);

    return;
  }

  SSEEventBus.emit(message.type, message as never);
};

const closeConnection = (): void => {
  if (reconnectTimer !== null) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (activeConnection) {
    activeConnection.source.close();
    activeConnection = null;
  }

  reconnectAttempts = 0;
};

const buildSubscribeUrl = (): string => {
  const url = new URL(REACT_APP_SSE_URL);
  url.searchParams.set("app", "ONLY_DOC");

  return url.toString();
};

const openConnection = (userId: string): void => {
  if (activeConnection?.userId === userId) return;

  if (activeConnection) closeConnection();

  // Cookie-auth subscribe endpoint — the JWT cookie identifies the user.
  // `userId` is only used to detect login/account changes and reopen the
  // connection (handled by the guard below + the React hook's dep).
  // `?app=ONLY_DOC` lets the notifications service route per-product events.
  const source = new EventSource(buildSubscribeUrl(), {
    withCredentials: true,
  });

  source.onopen = () => {
    reconnectAttempts = 0;
  };

  source.onmessage = (event: MessageEvent) => {
    dispatch(event.data as string);
  };

  source.onerror = (err) => {
    logger.warn("[sse] connection error", err);
    if (reconnectAttempts >= REACT_APP_SSE_MAX_RECONNECTION_ATTEMPTS) {
      closeConnection();

      return;
    }

    reconnectAttempts += 1;
    source.close();
    activeConnection = null;
    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null;
      openConnection(userId);
    }, REACT_APP_SSE_RECONNECTION_DELAY);
  };

  activeConnection = { source, userId };
};

/**
 * Opens an SSE connection to the notifications service and dispatches
 * incoming messages onto `SSEEventBus`. Idempotent: only one connection
 * exists per browser tab regardless of how many components mount this.
 *
 * Reopens automatically when `userId` changes (e.g. anonymous → logged in).
 */
export const useSseDispatcher = (): void => {
  const userId = useUserStore.use.user()?.id ?? null;

  useEffect(() => {
    if (!userId) {
      closeConnection();

      return;
    }

    openConnection(userId);

    // No teardown on unmount: the singleton is shared. The connection is
    // torn down only when userId changes (handled inside openConnection)
    // or when the tab closes.
  }, [userId]);
};
