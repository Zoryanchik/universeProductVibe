"use client";

import { useCallback, type FC, type PropsWithChildren } from "react";
import { Toaster } from "@universe-forma/ui-pes";

import { CustomSlot } from "@/shared/ui/CustomSlot";
import type { InternalFileType } from "@/shared/constants/file-type";
import { localeNavigate } from "@/shared/lib/navigation/localeNavigate";
import { closeModal, openModal } from "@/shared/lib/modals/modals-store";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import { logger } from "@/shared/lib/utils/logger";

import type { EFunnels } from "@/entities/documents";

import { useAiSummarizerStore } from "../model/store/ai-summarizer-store";
import { useCreateChatFromFile } from "../lib/hooks/use-create-chat-from-file";
import { useAiSummarizerErrorToast } from "../lib/use-ai-summarizer-error-toast";

interface Props extends PropsWithChildren {
  funnel: EFunnels;
  acceptedFormats: InternalFileType[];
}

// only-doc has a single non-localized landing slug for the summarizer, so the
// chat route is always /pdf-summarizer/chat regardless of language.
const CHAT_URL = (chatId: string): string =>
  `/pdf-summarizer/chat?chatId=${chatId}`;

export const AiSummarizerUploadWrapper: FC<Props> = ({
  funnel: _funnel,
  acceptedFormats,
  children,
}) => {
  const createAiChat = useCreateChatFromFile();
  const setAiCmsConfig = useAiSummarizerStore.use.setCmsConfig();
  const notifyError = useAiSummarizerErrorToast();

  const onFileUpload = useCallback(
    async (files: FileList) => {
      const file = files[0];
      if (!file) return;

      setAiCmsConfig({
        acceptedFormats: acceptedFormats.map((f) =>
          String(f).toUpperCase()
        ) as unknown as readonly string[],
        formatTo: "PDF",
      });

      // Estimate gives the progress bar room to climb so it doesn't look stuck.
      // PDFs are upload + init only; non-PDFs queue Lambda conversion too.
      const isPdf = file.name.toLowerCase().endsWith(".pdf");
      const estimatedDurationSeconds = isPdf ? 5 : 15;

      openModal({
        type: EModalsTypes.EDIT_UPLOADING,
        options: {
          downloadProgress: 0,
          durationSeconds: estimatedDurationSeconds,
          filename: file.name,
        },
      });

      try {
        const { chatId } = await createAiChat(file);
        // Navigate as soon as the conversation exists — the chat page mounts
        // SSE + ensurePreviewLoaded and renders PdfPanelLoader while waiting.
        // Keeping the wait here would hang for 5 min because the landing page
        // has no SSE dispatcher to feed waitForChatPreviewReady.
        localeNavigate(CHAT_URL(chatId));
      } catch (err) {
        logger.error("AI summarizer upload failed:", err);
        notifyError(err);
      } finally {
        closeModal(EModalsTypes.EDIT_UPLOADING);
      }
    },
    [acceptedFormats, createAiChat, notifyError, setAiCmsConfig]
  );

  return (
    <>
      <CustomSlot onFileUpload={onFileUpload}>{children}</CustomSlot>
      <Toaster />
    </>
  );
};
