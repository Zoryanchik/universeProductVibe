import React from "react";
import { showToast } from "@universe-forma/ui-pes";

import { useTranslation } from "@/shared/lib/translations";
import { trackEvent } from "@/shared/lib/analytics";
import { EAnalyticsEvents } from "@/shared/lib/analytics/events";
import { logger } from "@/shared/lib/utils/logger";

import { useAiSummarizerStore } from "@/features/aiSummarizer";
import type { IChatHistoryItem } from "@/features/aiSummarizer";
import { deleteConversation } from "@/features/aiSummarizer";
import { removePdfBlobForChat } from "@/features/aiSummarizer";

interface ChatHistoryProps {
  onSelect: (id: string) => void;
}

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);

  return `${mm}/${dd}/${yy}`;
};

export const ChatHistory: React.FC<ChatHistoryProps> = ({ onSelect }) => {
  const { t } = useTranslation();
  const chats = useAiSummarizerStore.use.chatsHistory();
  const currentChatId = useAiSummarizerStore.use.currentChatId();
  const removeChat = useAiSummarizerStore.use.removeChatHistoryItem();
  const reset = useAiSummarizerStore.use.reset();

  if (chats.length === 0) return null;

  return (
    <div className="mt-8 flex flex-col gap-1">
      <div className="px-3 text-xs font-semibold tracking-wide text-gray-500">
        {t("aiSummarizer.sidebar.history")}
      </div>
      {chats.map((chat) => (
        <ChatHistoryItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === currentChatId}
          onSelect={() => {
            trackEvent(EAnalyticsEvents.SUMMARIZER_VIEW_CHAT_TAP, {
              chat_id: chat.id,
            });
            onSelect(chat.id);
          }}
          onDelete={async () => {
            trackEvent(EAnalyticsEvents.SUMMARIZER_DELETE_CHAT_TAP, {
              chat_id: chat.id,
            });
            const wasActive = chat.id === currentChatId;
            try {
              await deleteConversation(chat.id);
            } catch (err) {
              logger.error("deleteConversation failed:", err);
              void showToast({
                title: t("aiSummarizer.sidebar.deleteFailed") as string,
                color: "error",
                variant: "filled",
                canClose: true,
                position: "top-center",
              });

              return;
            }
            removePdfBlobForChat(chat.id).catch(() => null);
            removeChat(chat.id);
            if (wasActive) {
              reset();
              const url = new URL(window.location.href);
              url.searchParams.delete("chatId");
              window.history.replaceState({}, "", url.toString());
            }
          }}
        />
      ))}
    </div>
  );
};

interface ChatHistoryItemProps {
  chat: IChatHistoryItem;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const ChatHistoryItem: React.FC<ChatHistoryItemProps> = ({
  chat,
  isActive,
  onSelect,
  onDelete,
}) => (
  <div
    className={[
      "group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors",
      isActive
        ? "bg-[color:var(--color-state-primary-hover)]"
        : "hover:bg-gray-50",
    ].join(" ")}
  >
    <FileIcon active={isActive} />
    <button
      type="button"
      onClick={onSelect}
      className="flex min-w-0 flex-1 cursor-pointer flex-col items-start text-start"
    >
      <span
        className={[
          "w-full truncate text-sm",
          isActive ? "font-semibold text-gray-900" : "text-gray-800",
        ].join(" ")}
      >
        {chat.fileName}
      </span>
      <span className="text-xs text-gray-400">
        {formatDate(chat.updatedAt)}
      </span>
    </button>
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-100 hover:text-red-500"
      aria-label="Delete"
    >
      <TrashIcon />
    </button>
  </div>
);

const FileIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <svg
    viewBox="0 0 24 24"
    className={[
      "h-5 w-5 shrink-0",
      active ? "text-[color:var(--color-primary)]" : "text-gray-400",
    ].join(" ")}
    fill="currentColor"
    aria-hidden
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm0 7V3.5L19.5 9H14z" />
  </svg>
);

const TrashIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden
  >
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
  </svg>
);
