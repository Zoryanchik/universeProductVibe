import { eventbus } from "../../lib/state/eventBus";
import type { ESSEventType } from "./sse-event-type";
import type {
  SSEOneTimePurchaseFailEvent,
  SSEFileProcessingErrorEvent,
  SSESubscriptionInitFailEvent,
  SSEOneTimePurchaseSuccessEvent,
  SSEFileProcessingSuccessEvent,
  SSEChatStatusChangedEvent,
  SSEChatPreviewReadyEvent,
} from "./types";

export type SSEEventBusEvents = {
  [ESSEventType.ONE_TIME_PURCHASE_FAIL]: (
    data: SSEOneTimePurchaseFailEvent
  ) => void;
  [ESSEventType.ONE_TIME_PURCHASE_SUCCESS]: (
    data: SSEOneTimePurchaseSuccessEvent
  ) => void;

  [ESSEventType.FILE_PROCESSING_ERROR]: (
    data: SSEFileProcessingErrorEvent
  ) => void;
  [ESSEventType.FILE_PROCESSING_RESULT]: (
    data: SSEFileProcessingSuccessEvent
  ) => void;

  [ESSEventType.INIT_SUBSCRIPTION_PAYMENT_FAIL]: (
    data: SSESubscriptionInitFailEvent
  ) => void;

  [ESSEventType.CHAT_STATUS_CHANGED]: (data: SSEChatStatusChangedEvent) => void;
  [ESSEventType.CHAT_PREVIEW_READY]: (data: SSEChatPreviewReadyEvent) => void;
};

export const SSEEventBus = eventbus<SSEEventBusEvents>();
