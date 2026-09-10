import React from "react";

import { useTranslation } from "@/shared/lib/translations";

import { useAiSummarizerStore } from "@/features/aiSummarizer";

import { NewChatButton } from "./NewChatButton";
import { ChatHistory } from "./ChatHistory";

interface SidebarProps {
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  showDesktopRail?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onNewChat,
  onSelectChat,
  showDesktopRail = true,
}) => {
  const { t } = useTranslation();
  const isMobileMenuOpen = useAiSummarizerStore.use.isMobileMenuOpen();
  const setMobileMenuOpen = useAiSummarizerStore.use.setMobileMenuOpen();
  const chatsHistory = useAiSummarizerStore.use.chatsHistory();
  const hasHistory = chatsHistory.length > 0;
  const mobileButtonLabel = hasHistory
    ? t("aiSummarizer.sidebar.newFile")
    : t("aiSummarizer.empty.uploadButton");

  return (
    <>
      {/* Desktop rail */}
      {showDesktopRail && (
        <aside className="hidden h-full w-72 shrink-0 border-e border-gray-200 bg-white p-6 md:flex md:flex-col">
          <NewChatButton onClick={onNewChat} />
          <ChatHistory onSelect={onSelectChat} />
        </aside>
      )}

      {/* Mobile overlay */}
      <div
        className={[
          "fixed inset-0 z-[1000] transition-opacity duration-300 md:hidden",
          isMobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
        aria-hidden={!isMobileMenuOpen}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setMobileMenuOpen(false)}
        />
        <aside
          className={[
            "absolute end-0 top-0 flex h-full w-full flex-col bg-white shadow-xl transition-transform duration-300",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full",
          ].join(" ")}
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <img
              src="/assets/header/logo-pdffly.svg"
              alt="pdffly"
              className="h-7 w-auto"
            />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-gray-700 hover:bg-gray-100"
              aria-label="Close menu"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col gap-2 px-6 pt-6">
            <NewChatButton
              onClick={() => {
                setMobileMenuOpen(false);
                onNewChat();
              }}
              label={mobileButtonLabel}
            />
            <ChatHistory
              onSelect={(id) => {
                setMobileMenuOpen(false);
                onSelectChat(id);
              }}
            />
          </div>
        </aside>
      </div>
    </>
  );
};
