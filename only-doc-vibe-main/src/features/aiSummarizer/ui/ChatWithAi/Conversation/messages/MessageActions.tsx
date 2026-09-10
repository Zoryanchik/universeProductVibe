import React, { useEffect, useRef, useState } from "react";

import { useTranslation } from "@/shared/lib/translations";

type Reaction = "like" | "dislike" | null;

interface MessageActionsProps {
  content: string;
  /**
   * Optional callback fired when the user picks (or clears) a reaction.
   * Reactions are otherwise kept as local state only. Wire this when the
   * feedback endpoint lands.
   */
  onReaction?: (reaction: Reaction) => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  content,
  onReaction,
}) => {
  const { t } = useTranslation();
  const [reaction, setReaction] = useState<Reaction>(null);

  const toggle = (value: Exclude<Reaction, null>) => {
    setReaction((current) => {
      const next = current === value ? null : value;
      onReaction?.(next);

      return next;
    });
  };

  return (
    <div className="flex items-center justify-between pt-1">
      <div className="flex items-center gap-1">
        <FeedbackButton
          label={t("aiSummarizer.chat.dislike")}
          active={reaction === "dislike"}
          onClick={() => toggle("dislike")}
        >
          <ThumbDownIcon />
        </FeedbackButton>
        <FeedbackButton
          label={t("aiSummarizer.chat.like")}
          active={reaction === "like"}
          onClick={() => toggle("like")}
        >
          <ThumbUpIcon />
        </FeedbackButton>
      </div>
      <CopyButton
        copyLabel={t("aiSummarizer.chat.copy")}
        copiedLabel={t("aiSummarizer.chat.copied")}
        content={content}
      />
    </div>
  );
};

interface ActionTooltipProps {
  label: string;
  forceVisible?: boolean;
  /**
   * Horizontal alignment of the tooltip relative to the trigger.
   * Use "right" for triggers at the right edge of a container to avoid
   * the tooltip clipping the viewport on narrow screens.
   */
  align?: "center" | "right";
  children: React.ReactNode;
}

const ActionTooltip: React.FC<ActionTooltipProps> = ({
  label,
  forceVisible = false,
  align = "center",
  children,
}) => {
  const isCentered = align === "center";
  const tooltipPosition = isCentered ? "left-1/2 -translate-x-1/2" : "end-0";
  const arrowPosition = isCentered ? "left-1/2 -translate-x-1/2" : "end-3";

  return (
    <div className="group relative">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute bottom-full mb-4 rounded-xl bg-[#4A4A4A] px-3 py-1 text-xs font-medium whitespace-nowrap text-white transition-opacity ${tooltipPosition} ${
          forceVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        {label}
        <span
          className={`absolute top-full h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-[#4A4A4A] ${arrowPosition}`}
        />
      </span>
    </div>
  );
};

interface FeedbackButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  label,
  active,
  onClick,
  children,
}) => (
  <ActionTooltip label={label}>
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors ${
        active
          ? "text-[color:var(--color-primary)]"
          : "text-black/50 hover:bg-gray-100 hover:text-black/70"
      }`}
    >
      {children}
    </button>
  </ActionTooltip>
);

interface CopyButtonProps {
  copyLabel: string;
  copiedLabel: string;
  content: string;
}

const COPIED_FEEDBACK_MS = 1500;

const CopyButton: React.FC<CopyButtonProps> = ({
  copyLabel,
  copiedLabel,
  content,
}) => {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    },
    []
  );

  const handleCopy = () => {
    void navigator.clipboard.writeText(content);
    setCopied(true);
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = window.setTimeout(() => {
      setCopied(false);
      resetTimerRef.current = null;
    }, COPIED_FEEDBACK_MS);
  };

  const label = copied ? copiedLabel : copyLabel;

  return (
    <ActionTooltip label={label} forceVisible={copied} align="right">
      <button
        type="button"
        aria-label={label}
        onClick={handleCopy}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-black/50 transition-colors hover:bg-gray-100 hover:text-black/70"
      >
        <CopyIcon />
      </button>
    </ActionTooltip>
  );
};

const CopyIcon: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path d="M7.5 15C7.04167 15 6.67361 14.8681 6.39583 14.6042C6.13194 14.3264 6 13.9583 6 13.5V3.5C6 3.04167 6.13194 2.68055 6.39583 2.41667C6.67361 2.13889 7.04167 2 7.5 2H15.5C15.9583 2 16.3194 2.13889 16.5833 2.41667C16.8611 2.68055 17 3.04167 17 3.5V13.5C17 13.9583 16.8611 14.3264 16.5833 14.6042C16.3194 14.8681 15.9583 15 15.5 15H7.5ZM7.5 13.5H15.5V3.5H7.5V13.5ZM3.75 6C3.54167 6 3.36111 5.93055 3.20833 5.79167C3.06944 5.63889 3 5.45833 3 5.25C3 5.04167 3.06944 4.86806 3.20833 4.72917C3.36111 4.57639 3.54167 4.5 3.75 4.5C3.95833 4.5 4.13194 4.57639 4.27083 4.72917C4.42361 4.86806 4.5 5.04167 4.5 5.25C4.5 5.45833 4.42361 5.63889 4.27083 5.79167C4.13194 5.93055 3.95833 6 3.75 6ZM3.75 9C3.54167 9 3.36111 8.93056 3.20833 8.79167C3.06944 8.63889 3 8.45833 3 8.25C3 8.04167 3.06944 7.86805 3.20833 7.72917C3.36111 7.57639 3.54167 7.5 3.75 7.5C3.95833 7.5 4.13194 7.57639 4.27083 7.72917C4.42361 7.86805 4.5 8.04167 4.5 8.25C4.5 8.45833 4.42361 8.63889 4.27083 8.79167C4.13194 8.93056 3.95833 9 3.75 9ZM3.75 12C3.54167 12 3.36111 11.9306 3.20833 11.7917C3.06944 11.6389 3 11.4583 3 11.25C3 11.0417 3.06944 10.8681 3.20833 10.7292C3.36111 10.5764 3.54167 10.5 3.75 10.5C3.95833 10.5 4.13194 10.5764 4.27083 10.7292C4.42361 10.8681 4.5 11.0417 4.5 11.25C4.5 11.4583 4.42361 11.6389 4.27083 11.7917C4.13194 11.9306 3.95833 12 3.75 12ZM3.75 15C3.54167 15 3.36111 14.9306 3.20833 14.7917C3.06944 14.6389 3 14.4583 3 14.25C3 14.0417 3.06944 13.8681 3.20833 13.7292C3.36111 13.5764 3.54167 13.5 3.75 13.5C3.95833 13.5 4.13194 13.5764 4.27083 13.7292C4.42361 13.8681 4.5 14.0417 4.5 14.25C4.5 14.4583 4.42361 14.6389 4.27083 14.7917C4.13194 14.9306 3.95833 15 3.75 15ZM3.75 18C3.54167 18 3.36111 17.9306 3.20833 17.7917C3.06944 17.6389 3 17.4583 3 17.25C3 17.0417 3.06944 16.8681 3.20833 16.7292C3.36111 16.5764 3.54167 16.5 3.75 16.5C3.95833 16.5 4.13194 16.5764 4.27083 16.7292C4.42361 16.8681 4.5 17.0417 4.5 17.25C4.5 17.4583 4.42361 17.6389 4.27083 17.7917C4.13194 17.9306 3.95833 18 3.75 18ZM6.75 18C6.54167 18 6.36111 17.9306 6.20833 17.7917C6.06944 17.6389 6 17.4583 6 17.25C6 17.0417 6.06944 16.8681 6.20833 16.7292C6.36111 16.5764 6.54167 16.5 6.75 16.5C6.95833 16.5 7.13194 16.5764 7.27083 16.7292C7.42361 16.8681 7.5 17.0417 7.5 17.25C7.5 17.4583 7.42361 17.6389 7.27083 17.7917C7.13194 17.9306 6.95833 18 6.75 18ZM9.75 18C9.54167 18 9.36111 17.9306 9.20833 17.7917C9.06944 17.6389 9 17.4583 9 17.25C9 17.0417 9.06944 16.8681 9.20833 16.7292C9.36111 16.5764 9.54167 16.5 9.75 16.5C9.95833 16.5 10.1319 16.5764 10.2708 16.7292C10.4236 16.8681 10.5 17.0417 10.5 17.25C10.5 17.4583 10.4236 17.6389 10.2708 17.7917C10.1319 17.9306 9.95833 18 9.75 18ZM12.75 18C12.5417 18 12.3611 17.9306 12.2083 17.7917C12.0694 17.6389 12 17.4583 12 17.25C12 17.0417 12.0694 16.8681 12.2083 16.7292C12.3611 16.5764 12.5417 16.5 12.75 16.5C12.9583 16.5 13.1319 16.5764 13.2708 16.7292C13.4236 16.8681 13.5 17.0417 13.5 17.25C13.5 17.4583 13.4236 17.6389 13.2708 17.7917C13.1319 17.9306 12.9583 18 12.75 18Z" />
  </svg>
);

const ThumbUpIcon: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M17.5 6.97917C17.875 6.97917 18.2153 7.13889 18.5208 7.45833C18.8403 7.76389 19 8.10417 19 8.47917V9.66667C19 9.77778 18.9861 9.88194 18.9583 9.97917C18.9444 10.0764 18.9167 10.1667 18.875 10.25L16.3958 16.0625C16.2708 16.3542 16.0347 16.5833 15.6875 16.75C15.3542 16.9167 15.0278 17 14.7083 17L5.5 16.9792V6.97917L10.375 2.10417C10.6389 1.84028 10.9375 1.67361 11.2708 1.60417C11.6181 1.52083 11.9306 1.55555 12.2083 1.70833C12.4722 1.86111 12.6389 2.11111 12.7083 2.45833C12.7917 2.79167 12.7917 3.15972 12.7083 3.5625L12 6.97917H17.5ZM7 7.60417V15.4792H15L17.5 9.66667V8.47917H10.1667L11.1875 3.4375L7 7.60417ZM2.5 16.9792C2.06944 16.9792 1.70833 16.8333 1.41667 16.5417C1.13889 16.25 1 15.8958 1 15.4792V8.47917C1 8.0625 1.13889 7.70833 1.41667 7.41667C1.70833 7.125 2.06944 6.97917 2.5 6.97917H5.5V8.47917H2.5V15.4792H5.5V16.9792H2.5Z"
      fill="currentColor"
    />
  </svg>
);

const ThumbDownIcon: React.FC = () => (
  <svg
    width="18"
    height="16"
    viewBox="0 0 18 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M1.5 10.0195C1.125 10.0195 0.777778 9.86675 0.458333 9.5612C0.152778 9.24175 8.9407e-08 8.89453 8.9407e-08 8.51953V7.33203C8.9407e-08 7.22092 0.00694453 7.11675 0.0208334 7.01953C0.0486112 6.92231 0.0833334 6.83203 0.125 6.7487L2.60417 0.936197C2.72917 0.64453 2.95833 0.415364 3.29167 0.248698C3.63889 0.0820302 3.97222 -0.00130343 4.29167 -0.00130343L13.5 0.0195308V10.0195L8.625 14.8945C8.36111 15.1584 8.05556 15.332 7.70833 15.4154C7.375 15.4848 7.07639 15.4431 6.8125 15.2904C6.53472 15.1376 6.35417 14.8945 6.27083 14.5612C6.20139 14.214 6.20833 13.839 6.29167 13.4362L7 10.0195H1.5ZM12 9.39453V1.51953H4L1.5 7.33203V8.51953H8.83333L7.8125 13.5612L12 9.39453ZM16.5 0.0195308C16.9306 0.0195308 17.2847 0.165364 17.5625 0.45703C17.8542 0.748697 18 1.10286 18 1.51953V8.51953C18 8.9362 17.8542 9.29036 17.5625 9.58203C17.2847 9.8737 16.9306 10.0195 16.5 10.0195H13.5V8.51953H16.5V1.51953H13.5V0.0195308H16.5Z"
      fill="currentColor"
    />
  </svg>
);
