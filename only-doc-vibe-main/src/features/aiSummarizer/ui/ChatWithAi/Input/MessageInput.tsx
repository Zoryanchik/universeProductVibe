import React, { useCallback, useEffect, useRef, useState } from "react";

import { useTranslation } from "@/shared/lib/translations";
import { trackEvent } from "@/shared/lib/analytics";
import { EAnalyticsEvents } from "@/shared/lib/analytics/events";

import { MAX_MESSAGE_CHARS } from "../../../model/constants";
import { useAiSummarizerStore } from "../../../model/store/ai-summarizer-store";

interface MessageInputProps {
  onSubmit: (text: string) => void | Promise<void>;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSubmit }) => {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const status = useAiSummarizerStore.use.status();
  const disabled = status === "waiting" || isSubmitting;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [text]);

  const handleSubmit = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    setText("");
    setIsSubmitting(true);
    try {
      await onSubmit(trimmed);
    } catch {
      // Restore the typed text so the user can retry without re-typing.
      // The actual error toast is surfaced by the onSubmit caller.
      setText(trimmed);
    } finally {
      setIsSubmitting(false);
    }
  }, [text, disabled, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleFocus = () => {
    trackEvent(EAnalyticsEvents.SUMMARIZER_START_PROMPT, {});
  };

  const showCounter = text.length > 15000;
  const isEmpty = !text.trim();

  const handlePillMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button, textarea")) return;

    e.preventDefault();
    textareaRef.current?.focus();
  };

  return (
    <div className="bg-white px-4 pt-4 pb-8">
      <div className="mx-auto w-full max-w-3xl">
        <div
          onMouseDown={handlePillMouseDown}
          className="flex min-h-[72px] cursor-text items-center gap-3 rounded-xl border-2 border-transparent bg-[color:var(--color-os-filled-input-bg)] px-5 py-4 transition-colors focus-within:border-[color:var(--color-primary)] focus-within:bg-[color:var(--color-primary-filled-50)] focus-within:shadow-[0_0_0_4px_var(--color-primary-opacity-8)]"
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) =>
              setText(e.target.value.slice(0, MAX_MESSAGE_CHARS))
            }
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            rows={1}
            placeholder={t("aiSummarizer.chat.inputPlaceholder")}
            disabled={disabled}
            className="flex-1 resize-none bg-transparent text-start text-base text-gray-900 outline-none placeholder:text-gray-400"
            style={{ maxHeight: 140 }}
          />
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={disabled || isEmpty}
            className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-colors ${
              isEmpty
                ? "bg-[color:var(--color-action-16)] text-[color:var(--color-text-disabled)] opacity-60"
                : "bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-primary-dark)]"
            } disabled:cursor-not-allowed`}
            aria-label={t("aiSummarizer.chat.sendButton")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path d="M6.59961 3.39922L1.69961 8.29922C1.49961 8.49922 1.26628 8.59922 0.99961 8.59922C0.732943 8.58255 0.49961 8.47422 0.29961 8.27422C0.116276 8.07422 0.0162761 7.84089 -0.00039053 7.57422C-0.00039053 7.30755 0.0996095 7.07422 0.29961 6.87422L6.89961 0.274217C6.99961 0.174218 7.10794 0.107551 7.22461 0.0742173C7.34128 0.0242171 7.46628 -0.000782967 7.59961 -0.000782967C7.73294 -0.000782967 7.85794 0.0242171 7.97461 0.0742173C8.09128 0.107551 8.19961 0.174218 8.29961 0.274217L14.8996 6.87422C15.0829 7.05755 15.1746 7.29088 15.1746 7.57422C15.1746 7.84089 15.0829 8.07422 14.8996 8.27422C14.6996 8.47422 14.4579 8.57422 14.1746 8.57422C13.9079 8.57422 13.6746 8.47422 13.4746 8.27422L8.59961 3.39922V14.5742C8.59961 14.8576 8.49961 15.0992 8.29961 15.2992C8.11628 15.4826 7.88294 15.5742 7.59961 15.5742C7.31628 15.5742 7.07461 15.4826 6.87461 15.2992C6.69128 15.0992 6.59961 14.8576 6.59961 14.5742V3.39922Z" />
            </svg>
          </button>
        </div>
        {showCounter && (
          <div className="mt-1 text-end text-xs text-gray-400">
            {text.length} / {MAX_MESSAGE_CHARS}
          </div>
        )}
      </div>
    </div>
  );
};
