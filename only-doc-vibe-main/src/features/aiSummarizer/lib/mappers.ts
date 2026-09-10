import type { ConversationItem, MessageItem } from "../api/types";
import type { IChatHistoryItem, IChatMessage } from "../model/types";
import { conversationItemToHistoryItem } from "../model/types";

/**
 * Re-export under a shorter name for use-site clarity.
 */
export const conversationToHistoryItem = (
  item: ConversationItem
): IChatHistoryItem => conversationItemToHistoryItem(item);

/**
 * Synthesize createdAt timestamps so the UI can sort messages stably.
 * The BE doesn't return per-message timestamps in the list response —
 * createdAt only serves as a sort key, not a display value.
 */
export const messagesToChatMessages = (
  messages: MessageItem[],
  chatId: string
): IChatMessage[] =>
  messages.map((m, idx) => ({
    ...m,
    chatId,
    createdAt: new Date(Date.now() + idx).toISOString(),
  }));
