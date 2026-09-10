import type { ChatStatus, ConversationItem, MessageItem } from "../api/types";

export interface AiSummarizerCmsConfig {
  acceptedFormats: readonly string[];
  formatTo: string;
}

export interface IChatMessage extends MessageItem {
  chatId: string;
  createdAt: string;
}

export interface IChatHistoryItem {
  id: string;
  fileName: string;
  status: ChatStatus;
  updatedAt: string;
  previewFileId: string;
}

export const conversationItemToHistoryItem = (
  item: ConversationItem
): IChatHistoryItem => ({
  id: item.id,
  fileName: item.chatName ?? "Untitled",
  status: item.status,
  updatedAt: item.updatedAt,
  previewFileId: item.previewFileId,
});
