export type ChatStatus = "WAITING" | "READY" | "FAILED";

export interface ConversationItem {
  id: string;
  status: ChatStatus;
  chatName: string | null;
  summary: string | null;
  insights: string[] | null;
  suggestedQuestions: string[] | null;
  createdAt: string;
  updatedAt: string;
  previewFileId: string;
}

export interface MessageItem {
  role: "user" | "assistant";
  content: string;
}

export interface InitializeConversationPayload {
  filename: string;
  size: number;
  key: string;
  pagesCount?: number | null;
}

export interface InitializeConversationResult {
  chatId: string;
  status: ChatStatus;
  chatName: string | null;
  fileId: string;
  previewFileId: string;
}

export interface SendMessageResult {
  answer: string;
}
