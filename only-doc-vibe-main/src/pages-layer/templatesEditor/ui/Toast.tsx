import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from "react";

import { cn } from "@/shared/lib/utils/cn";
import { useTranslation } from "@/shared/lib/translations";

import { useTemplatesEditorStore } from "../model/store/templates-editor-store";

export type ToastVariant = "danger" | "warning" | "success";

const VARIANT_ICONS: Record<ToastVariant, string> = {
  danger: "error",
  warning: "warning",
  success: "check_circle",
};

const variantBgStyles: Record<ToastVariant, string> = {
  danger:
    "[background-image:linear-gradient(90deg,rgba(244,67,54,0.24)_0%,rgba(244,67,54,0.24)_100%),linear-gradient(90deg,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0.85)_100%)]",
  warning:
    "[background-image:linear-gradient(90deg,rgba(255,153,0,0.24)_0%,rgba(255,153,0,0.24)_100%),linear-gradient(90deg,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0.85)_100%)]",
  success:
    "[background-image:linear-gradient(90deg,rgba(76,175,80,0.24)_0%,rgba(76,175,80,0.24)_100%),linear-gradient(90deg,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0.85)_100%)]",
};

const variantIconWrapperStyles: Record<ToastVariant, string> = {
  danger: "bg-[rgba(240,68,56,0.16)]",
  warning: "bg-[rgba(255,153,0,0.16)]",
  success: "bg-[rgba(76,175,80,0.16)]",
};

const variantIconColorStyles: Record<ToastVariant, string> = {
  danger: "text-[var(--color-error-dark)]",
  warning: "text-[var(--color-warning-dark)]",
  success: "text-[var(--color-success-dark)]",
};

interface ToastContentProps {
  header: string;
  content: ReactNode;
  variant: ToastVariant;
  button?: {
    label: string;
    onClick: () => void;
    closeOnClick?: boolean;
  };
  autoCloseOnCondition?: () => boolean;
  autoCloseMs?: number;
  onClose: () => void;
  closeLabel?: string;
}

const ToastContent: FC<ToastContentProps> = ({
  header,
  content,
  variant,
  button,
  autoCloseOnCondition,
  autoCloseMs,
  onClose,
  closeLabel,
}) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const DEFAULT_AUTO_CLOSE_MS = variant === "success" && !button ? 2000 : 7000;
  const remainingRef = useRef(autoCloseMs ?? DEFAULT_AUTO_CLOSE_MS);
  const startedAtRef = useRef(Date.now());

  const close = useCallback(() => {
    setVisible(false);
    onClose();
  }, [onClose]);

  const startTimer = useCallback(() => {
    if (autoCloseOnCondition) return;

    clearTimeout(timerRef.current);
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(close, remainingRef.current);
  }, [close, autoCloseOnCondition]);

  const pauseTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    remainingRef.current -= Date.now() - startedAtRef.current;
  }, []);

  useEffect(() => {
    startTimer();

    return () => clearTimeout(timerRef.current);
  }, [startTimer]);

  useEffect(() => {
    if (!autoCloseOnCondition) return;

    const id = setInterval(() => {
      if (autoCloseOnCondition()) close();
    }, 300);

    return () => clearInterval(id);
  }, [autoCloseOnCondition, close]);

  const handleButtonClick = () => {
    button?.onClick();
    const { closeOnClick = true } = button ?? {};

    if (closeOnClick) {
      close();
    }
  };

  if (!visible) return null;

  return (
    <div
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
      className="pointer-events-auto"
    >
      <div
        className={cn(
          "flex w-full items-start gap-4 rounded-2xl p-4 backdrop-blur-[50px]",
          variantBgStyles[variant]
        )}
      >
        <div
          className={cn(
            "flex h-10 min-h-10 w-10 min-w-10 shrink-0 items-center justify-center rounded-xl p-2",
            variantIconWrapperStyles[variant]
          )}
        >
          <span
            className={cn(
              "material-symbols-rounded text-2xl [font-variation-settings:'FILL'_1,'wght'_400,'GRAD'_0,'opsz'_24]",
              variantIconColorStyles[variant]
            )}
          >
            {VARIANT_ICONS[variant]}
          </span>
        </div>

        <div className="flex min-h-10 min-w-0 flex-[1_0_0] flex-col justify-center text-[var(--color-text-primary)]">
          <p className="m-0 font-[Outfit,sans-serif] text-[18px] leading-5 font-semibold">
            {header}
          </p>
          <div className="font-[Outfit,sans-serif] text-[16px] leading-[22px] font-normal">
            {content}
          </div>
        </div>

        <div className="flex shrink-0 items-center ps-2">
          {button && (
            <button
              type="button"
              onClick={handleButtonClick}
              className="flex min-h-8 cursor-pointer items-center justify-center gap-1 border-none bg-transparent px-2 py-1.5 font-[Outfit,sans-serif] text-[14px] leading-5 font-medium whitespace-nowrap text-[var(--color-text-primary)] hover:opacity-80"
            >
              {button.label}
            </button>
          )}
          {closeLabel ? (
            <button
              type="button"
              onClick={close}
              className="flex min-h-8 cursor-pointer items-center justify-center gap-1 border-none bg-transparent px-2 py-1.5 font-[Outfit,sans-serif] text-[14px] leading-5 font-medium whitespace-nowrap text-[var(--color-text-primary)] hover:opacity-80"
            >
              {closeLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={close}
              aria-label={t("templatesEditor.ui.close") as string}
              className="flex cursor-pointer items-center justify-center rounded-lg border-none bg-transparent p-1.5 hover:bg-[var(--color-action-hover)]"
            >
              <span className="material-symbols-rounded text-[20px] text-[var(--color-action-active)] [font-variation-settings:'FILL'_0,'wght'_400,'GRAD'_0,'opsz'_20]">
                close
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const Toast: FC = () => {
  const toasts = useTemplatesEditorStore.use.toasts();
  const hideToast = useTemplatesEditorStore.use.hideToast();

  const handleClose = useCallback((_id: number) => hideToast(_id), [hideToast]);

  if (!toasts.length) return null;

  return createPortal(
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[9999] box-border flex w-full max-w-[800px] -translate-x-1/2 flex-col-reverse gap-6 px-4">
      {toasts.map((toast) => (
        <ToastContent
          key={toast._id}
          header={toast.header}
          content={toast.content}
          variant={toast.variant ?? "danger"}
          button={toast.button}
          autoCloseOnCondition={toast.autoCloseOnCondition}
          autoCloseMs={toast.autoCloseMs}
          onClose={() => {
            handleClose(toast._id!);
            toast.onClose?.();
          }}
          closeLabel={toast.closeLabel}
        />
      ))}
    </div>,
    document.body
  );
};
