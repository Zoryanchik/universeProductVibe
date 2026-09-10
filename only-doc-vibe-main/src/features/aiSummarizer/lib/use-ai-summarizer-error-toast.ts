import { useCallback } from "react";
import { showToast } from "@universe-forma/ui-pes";

import { useTranslation } from "@/shared/lib/translations/useTranslation";

import {
  MAX_FILE_SIZE_MB,
  MAX_MESSAGE_CHARS,
  MAX_PAGES,
} from "../model/constants";
import {
  FileTooLargeError,
  TooManyPagesError,
  UnsupportedFileError,
} from "./hooks/use-create-chat-from-file";
import { MessageTooLongError } from "./hooks/use-send-message";
import {
  PreviewProcessingFailedError,
  PreviewReadyTimeoutError,
} from "../api/wait-for-chat-preview-ready";

export type AiSummarizerErrorKind =
  | "fileTooLarge"
  | "tooManyPages"
  | "formatNotSupported"
  | "processingFailed"
  | "sendFailed"
  | "loadFailed"
  | "messageTooLong";

const resolveKind = (
  err: unknown,
  fallback: AiSummarizerErrorKind
): AiSummarizerErrorKind => {
  if (err instanceof FileTooLargeError) return "fileTooLarge";

  if (err instanceof TooManyPagesError) return "tooManyPages";

  if (err instanceof UnsupportedFileError) return "formatNotSupported";

  if (err instanceof MessageTooLongError) return "messageTooLong";

  if (
    err instanceof PreviewProcessingFailedError ||
    err instanceof PreviewReadyTimeoutError
  ) {
    return "processingFailed";
  }

  return fallback;
};

interface NotifyOptions {
  /** Override the detected error kind. */
  kind?: AiSummarizerErrorKind;
  /** Kind to use when err is not a known domain error. Defaults to "processingFailed". */
  fallback?: AiSummarizerErrorKind;
}

/**
 * Maps an AI summarizer domain error to a localized, user-facing toast.
 * Domain errors (FileTooLargeError, MessageTooLongError, ...) map 1:1 to a
 * translation key under `aiSummarizer.errors.*`. Unknown errors fall back to
 * a configurable kind (default: "processingFailed").
 */
export const useAiSummarizerErrorToast = () => {
  const { t } = useTranslation();

  return useCallback(
    (err: unknown, options: NotifyOptions = {}): void => {
      const kind =
        options.kind ??
        resolveKind(err, options.fallback ?? "processingFailed");

      const messageByKind: Record<AiSummarizerErrorKind, string> = {
        fileTooLarge: String(
          t("aiSummarizer.errors.fileTooLarge", { maxMb: MAX_FILE_SIZE_MB })
        ),
        tooManyPages: String(
          t("aiSummarizer.errors.tooManyPages", { maxPages: MAX_PAGES })
        ),
        formatNotSupported: String(t("aiSummarizer.errors.formatNotSupported")),
        processingFailed: String(t("aiSummarizer.errors.processingFailed")),
        sendFailed: String(t("aiSummarizer.errors.sendFailed")),
        loadFailed: String(t("aiSummarizer.errors.loadFailed")),
        messageTooLong: String(
          t("aiSummarizer.errors.messageTooLong", {
            maxChars: MAX_MESSAGE_CHARS,
          })
        ),
      };

      void showToast({
        title: messageByKind[kind],
        color: "error",
        variant: "filled",
        canClose: true,
        position: "top-center",
        autoClose: 5000,
      });
    },
    [t]
  );
};
