import type { IUser } from "@/entities/user";
import type { ECreationTypes, EProcessingStatus } from "@/entities/documents";

import type { ECompressionLevel } from "@/features/compress";

import type { InternalFileType } from "../../constants/file-type";
import type { ESSEventType } from "./sse-event-type";

interface IBaseMessageEvent<
  T extends ESSEventType = ESSEventType,
  D = Record<string, unknown>,
> {
  data: D;
  userId: string;
  type: T;
}

export type SSESubscriptionInitFailEvent = IBaseMessageEvent<
  ESSEventType.INIT_SUBSCRIPTION_PAYMENT_FAIL,
  ISubscriptionInitFailMessageData
>;

export interface ISubscriptionInitFailMessageData {
  subscriptionId: string;
  productId: string;
  error: {
    code: string;
    solution: string;
    message?: string;
  };
}

export type SSEOneTimePurchaseFailEvent = IBaseMessageEvent<
  ESSEventType.ONE_TIME_PURCHASE_FAIL,
  IOneTimePurchaseFailMessageData
>;

interface IOneTimePurchaseFailMessageDataSolidgateError {
  code: string;
  messages: string[];
  recommended_message_for_user?: string;
}

interface IOneTimePurchaseFailMessageDataSolidgateException {
  status: number;
  code: string;
  messages: Record<string, unknown> | string[];
}

export type IOneTimePurchaseFailMessageData =
  | IOneTimePurchaseFailMessageDataSolidgateError
  | IOneTimePurchaseFailMessageDataSolidgateException;

export type SSEFileProcessingErrorEvent = IBaseMessageEvent<
  ESSEventType.FILE_PROCESSING_ERROR,
  IFileProcessingErrorMessageData
>;

export interface IOneTimePurchaseSuccessMessageData {
  product: { id: string; name: string };
}

export type SSEOneTimePurchaseSuccessEvent = IBaseMessageEvent<
  ESSEventType.ONE_TIME_PURCHASE_SUCCESS,
  IOneTimePurchaseSuccessMessageData
>;

export interface IFileProcessingErrorMessageData {
  id: string;
  message: string | null;
}

export type IFileProcessingResultData = {
  id: string;
  original_file_id: string | null;
  preview_file_id: string | null;
  orderIndex: number | null;
  aws_key: string;
  aws_url: string;
  size: number;
  pages_count: number | null;
  filename: string;
  error_code?: string | null;
  error_message?: string | null;
  deleted: boolean;
  processing_status: EProcessingStatus;
  internal_type: InternalFileType;
  compress_level: ECompressionLevel | null;
  creation_type: ECreationTypes;
  user: IUser;
  userId: string;
  chat: unknown[];
  created_at: string;
  updated_at: string;
};

export type SSEFileProcessingSuccessEvent = IBaseMessageEvent<
  ESSEventType.FILE_PROCESSING_RESULT,
  IFileProcessingResultData
>;

export interface SSEChatStatusChangedEvent {
  chatId: string;
  status: "READY" | "WAITING" | "FAILED";
}

export interface SSEChatPreviewReadyEvent {
  chatId: string;
  previewFileId: string;
}

export type SSESubscriptionEventsMap = {
  [ESSEventType.INIT_SUBSCRIPTION_PAYMENT_FAIL]: SSESubscriptionInitFailEvent;
  [ESSEventType.ONE_TIME_PURCHASE_FAIL]: SSEOneTimePurchaseFailEvent;
  [ESSEventType.ONE_TIME_PURCHASE_SUCCESS]: SSEOneTimePurchaseSuccessEvent;
  [ESSEventType.FILE_PROCESSING_ERROR]: SSEFileProcessingErrorEvent;
  [ESSEventType.FILE_PROCESSING_RESULT]: SSEFileProcessingSuccessEvent;
  [ESSEventType.CHAT_STATUS_CHANGED]: SSEChatStatusChangedEvent;
  [ESSEventType.CHAT_PREVIEW_READY]: SSEChatPreviewReadyEvent;
};

export type IMessageEvent =
  | SSESubscriptionInitFailEvent
  | SSEOneTimePurchaseFailEvent
  | SSEOneTimePurchaseSuccessEvent
  | SSEFileProcessingErrorEvent
  | SSEFileProcessingSuccessEvent;
