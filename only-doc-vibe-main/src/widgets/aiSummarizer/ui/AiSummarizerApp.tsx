import React, { useCallback, useEffect } from "react";
import { Toaster } from "@universe-forma/ui-pes";

import { trackEvent } from "@/shared/lib/analytics";
import { EAnalyticsEvents } from "@/shared/lib/analytics/events";
import { useTranslation } from "@/shared/lib/translations";
import { useSseDispatcher } from "@/shared/api/sse/useSseDispatcher";
import { logger } from "@/shared/lib/utils/logger";

import type { AiSummarizerCmsConfig } from "@/features/aiSummarizer";
import {
  useAiSummarizerStore,
  useCreateChatFromFile,
  useLoadChat,
  useFilePicker,
  conversationToHistoryItem,
  useAiSummarizerErrorToast,
} from "@/features/aiSummarizer";
import { getConversations } from "@/features/aiSummarizer";
import { ChatWithAi } from "@/features/aiSummarizer";

import { Sidebar } from "./Sidebar/Sidebar";
import { MobileMenuToggle } from "./Sidebar/MobileMenuToggle";
import { PdfPanel } from "./PdfPanel";

interface AiSummarizerAppProps {
  cmsConfig: AiSummarizerCmsConfig;
}

export const AiSummarizerApp: React.FC<AiSummarizerAppProps> = ({
  cmsConfig,
}) => {
  const setCmsConfig = useAiSummarizerStore.use.setCmsConfig();
  const setChatsHistory = useAiSummarizerStore.use.setChatsHistory();
  const reset = useAiSummarizerStore.use.reset();
  const chatsHistory = useAiSummarizerStore.use.chatsHistory();
  const currentChatId = useAiSummarizerStore.use.currentChatId();
  const createChat = useCreateChatFromFile();
  const loadChat = useLoadChat();
  const filePicker = useFilePicker();
  const notifyError = useAiSummarizerErrorToast();
  const { t } = useTranslation();
  useSseDispatcher();

  const showSidebar = chatsHistory.length > 0 || currentChatId !== null;

  useEffect(() => {
    setCmsConfig(cmsConfig);
    trackEvent(EAnalyticsEvents.SUMMARIZER_PAGE_VIEW, {});

    getConversations()
      .then((items) => setChatsHistory(items.map(conversationToHistoryItem)))
      .catch((err) => logger.error("getConversations failed:", err));

    const url = new URL(window.location.href);
    const chatId = url.searchParams.get("chatId");
    if (chatId) {
      loadChat(chatId).catch((err) => {
        logger.error("loadChat failed:", err);
        notifyError(err, { fallback: "loadFailed" });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerUpload = useCallback(() => {
    filePicker.openPicker();
  }, [filePicker]);

  const handleFile = useCallback(
    async (file: File) => {
      const prevChatId = useAiSummarizerStore.getState().currentChatId;

      reset();
      try {
        const { chatId } = await createChat(file);
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("chatId", chatId);
        window.history.replaceState({}, "", newUrl.toString());
        loadChat(chatId).catch((err) => {
          logger.error("loadChat failed:", err);
          notifyError(err, { fallback: "loadFailed" });
        });
      } catch (err) {
        logger.error("createChat failed:", err);
        notifyError(err);

        if (prevChatId) {
          loadChat(prevChatId).catch((loadErr) => {
            logger.error("loadChat (recovery) failed:", loadErr);
          });
        }
      }
    },
    [createChat, loadChat, notifyError, reset]
  );

  const handleSelectChat = useCallback(
    (id: string) => {
      reset();
      loadChat(id).catch((err) => {
        logger.error("loadChat failed:", err);
        notifyError(err, { fallback: "loadFailed" });
      });
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("chatId", id);
      window.history.replaceState({}, "", newUrl.toString());
    },
    [loadChat, notifyError, reset]
  );

  return (
    <>
      <input
        ref={filePicker.inputRef}
        type="file"
        accept={filePicker.acceptAttribute}
        onChange={(e) => filePicker.handleFileChange(e, handleFile)}
        className="hidden"
      />
      {/* Mobile-only header: title on left, hamburger on right */}
      <div className="flex items-center justify-between bg-white px-4 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.12)] md:hidden">
        <h1 className="text-xl font-bold text-gray-900">
          {t("aiSummarizer.page.title")}
        </h1>
        <MobileMenuToggle />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onNewChat={triggerUpload}
          onSelectChat={handleSelectChat}
          showDesktopRail={showSidebar}
        />
        {/* PDF panel: desktop always; mobile only when no chat */}
        <PdfPanel
          onUpload={triggerUpload}
          hiddenOnMobile={currentChatId !== null}
        />
        {/* Chat: desktop always; mobile only when a chat exists */}
        <div
          className={[
            "flex-1 flex-col md:flex",
            currentChatId !== null ? "flex" : "hidden",
          ].join(" ")}
        >
          <ChatWithAi onUpload={triggerUpload} />
        </div>
      </div>
      <Toaster />
    </>
  );
};
