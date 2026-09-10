import { create } from "zustand";

import { createSelectors } from "@/shared/lib/state/createSelectors";

import { isCachedChatPreviewObjectUrl } from "../../lib/pdf-blob-storage";
import type {
  AiSummarizerCmsConfig,
  IChatHistoryItem,
  IChatMessage,
} from "../types";

/**
 * Revokes a replaced blob URL, skipping URLs that the IndexedDB cache may
 * hand back again. Deferred via setTimeout(0) so any in-flight render still
 * pointing at the old URL completes before it becomes invalid.
 */
const revokeReplacedBlobUrl = (prev: string | null, next: string | null) => {
  if (!prev || prev === next) return;

  if (!prev.startsWith("blob:")) return;

  if (isCachedChatPreviewObjectUrl(prev)) return;

  setTimeout(() => URL.revokeObjectURL(prev), 0);
};

export type ChatViewStatus = "idle" | "waiting" | "ready" | "failed";

interface AiSummarizerState {
  cmsConfig: AiSummarizerCmsConfig | null;
  chatsHistory: IChatHistoryItem[];
  fileId: string | null;
  previewFileId: string | null;
  currentChatId: string | null;
  messages: IChatMessage[];
  currentFileUrl: string | null;
  fileName: string | null;
  isMobileMenuOpen: boolean;
  summary: string | null;
  insights: string[] | null;
  suggestedQuestions: string[] | null;
  status: ChatViewStatus;
  isSending: boolean;
}

interface AiSummarizerActions {
  setCmsConfig: (cfg: AiSummarizerCmsConfig) => void;
  setChatsHistory: (items: IChatHistoryItem[]) => void;
  upsertChatHistoryItem: (item: IChatHistoryItem) => void;
  removeChatHistoryItem: (id: string) => void;
  setFileId: (id: string | null) => void;
  setPreviewFileId: (id: string | null) => void;
  setCurrentChatId: (id: string | null) => void;
  setMessages: (messages: IChatMessage[]) => void;
  addUserMessage: (content: string) => void;
  addAssistantMessage: (content: string) => void;
  clearMessages: () => void;
  setCurrentFileUrl: (url: string | null) => void;
  setFileName: (name: string | null) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setSummary: (summary: string | null) => void;
  setInsights: (insights: string[] | null) => void;
  setSuggestedQuestions: (qs: string[] | null) => void;
  setStatus: (s: ChatViewStatus) => void;
  setIsSending: (sending: boolean) => void;
  reset: () => void;
}

const initialState: AiSummarizerState = {
  cmsConfig: null,
  chatsHistory: [],
  fileId: null,
  previewFileId: null,
  currentChatId: null,
  messages: [],
  currentFileUrl: null,
  fileName: null,
  isMobileMenuOpen: false,
  summary: null,
  insights: null,
  suggestedQuestions: null,
  status: "idle",
  isSending: false,
};

const aiSummarizerStore = create<AiSummarizerState & AiSummarizerActions>()(
  (set, get) => ({
    ...initialState,

    setCmsConfig: (cmsConfig) => set({ cmsConfig }),
    setChatsHistory: (chatsHistory) => set({ chatsHistory }),
    upsertChatHistoryItem: (item) =>
      set((state) => {
        const without = state.chatsHistory.filter((c) => c.id !== item.id);

        return { chatsHistory: [item, ...without] };
      }),
    removeChatHistoryItem: (id) =>
      set((state) => ({
        chatsHistory: state.chatsHistory.filter((c) => c.id !== id),
      })),

    setFileId: (fileId) => set({ fileId }),
    setPreviewFileId: (previewFileId) => set({ previewFileId }),
    setCurrentChatId: (currentChatId) => set({ currentChatId }),

    setMessages: (messages) => set({ messages }),
    addUserMessage: (content) => {
      const chatId = get().currentChatId ?? "";
      set((state) => ({
        messages: [
          ...state.messages,
          {
            chatId,
            role: "user",
            content,
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    },
    addAssistantMessage: (content) => {
      const chatId = get().currentChatId ?? "";
      set((state) => ({
        messages: [
          ...state.messages,
          {
            chatId,
            role: "assistant",
            content,
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    },
    clearMessages: () => set({ messages: [] }),

    setCurrentFileUrl: (currentFileUrl) =>
      set((state) => {
        revokeReplacedBlobUrl(state.currentFileUrl, currentFileUrl);

        return { currentFileUrl };
      }),
    setFileName: (fileName) => set({ fileName }),
    setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
    setSummary: (summary) => set({ summary }),
    setInsights: (insights) => set({ insights }),
    setSuggestedQuestions: (suggestedQuestions) => set({ suggestedQuestions }),
    setStatus: (status) => set({ status }),
    setIsSending: (isSending) => set({ isSending }),

    reset: () => {
      const prevFileUrl = get().currentFileUrl;
      set({
        ...initialState,
        cmsConfig: get().cmsConfig,
        chatsHistory: get().chatsHistory,
      });
      revokeReplacedBlobUrl(prevFileUrl, null);
    },
  })
);

export const useAiSummarizerStore = createSelectors(aiSummarizerStore);
