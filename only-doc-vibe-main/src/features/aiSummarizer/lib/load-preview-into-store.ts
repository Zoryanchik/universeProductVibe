import { logger } from "@/shared/lib/utils/logger";

import { getDocumentById } from "@/entities/documents";

import { useAiSummarizerStore } from "../model/store/ai-summarizer-store";
import { savePdfBlobForChat } from "./pdf-blob-storage";

/**
 * Fetch-by-fileId path used when the IndexedDB cache misses.
 *
 * Lets `getDocumentById` throw (e.g. 404 — preview not converted yet) so the
 * caller can retry on `chat-preview-ready`. If the blob wrap itself fails
 * (CORS / network), falls back to the raw URL so the iframe still renders.
 *
 * When `chatId` is passed, the function refuses to write into the store if the
 * user has switched chats while the fetch was in flight, and revokes the just-
 * created blob URL so we don't leak it.
 */
export const loadPreviewIntoStore = async (
  previewFileId: string,
  chatId?: string
): Promise<void> => {
  const { url } = await getDocumentById(previewFileId);

  let blobUrl: string;
  let blob: Blob | null = null;
  try {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const rawBlob = await res.blob();

    blob =
      rawBlob.type === "application/pdf"
        ? rawBlob
        : new Blob([rawBlob], { type: "application/pdf" });
    blobUrl = URL.createObjectURL(blob);
  } catch (error) {
    logger.warn(
      "loadPreviewIntoStore: blob wrap failed, falling back to direct URL",
      error
    );
    blobUrl = url;
  }

  const store = useAiSummarizerStore.getState();
  if (chatId && store.currentChatId !== chatId) {
    if (blobUrl.startsWith("blob:")) URL.revokeObjectURL(blobUrl);

    return;
  }

  if (chatId && blob) {
    savePdfBlobForChat(chatId, blob).catch(() => null);
  }

  store.setCurrentFileUrl(blobUrl);
};
