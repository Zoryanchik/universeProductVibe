export enum ESSEventType {
  ONE_TIME_PURCHASE_FAIL = "one-time-purchase-fail",
  ONE_TIME_PURCHASE_SUCCESS = "one-time-purchase-success",
  FILE_PROCESSING_ERROR = "file-processing-error",
  FILE_PROCESSING_RESULT = "file-processing-result",
  INIT_SUBSCRIPTION_PAYMENT_FAIL = "init-subscription-payment-fail",
  CHAT_STATUS_CHANGED = "chat-status-changed",
  CHAT_PREVIEW_READY = "chat-preview-ready",
}

export const ALL_SSE_EVENTS = Object.values(ESSEventType);

export const isSSEEventType = (value: string): value is ESSEventType =>
  ALL_SSE_EVENTS.includes(value as ESSEventType);
