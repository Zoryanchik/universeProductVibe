import { useEffect, useRef, useState, type FC } from "react";
import { createPortal } from "react-dom";

import { cn } from "../../lib/utils/cn";
import {
  dismissToast,
  useToastStore,
  type IToast,
} from "../../lib/toast/toast-store";

// ─── Icon components ──────────────────────────────────────────────────────────

const LinkSvg: FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M10 14a5 5 0 0 0 7.07 0l3-3a5 5 0 1 0-7.07-7.07l-1 1M14 10a5 5 0 0 0-7.07 0l-3 3a5 5 0 1 0 7.07 7.07l1-1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const InfoSvg: FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
  </svg>
);

const CheckSvg: FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M5 13l4 4L19 7"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MailSvg: FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="m4 7 8 6 8-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const AlertSvg: FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);

const ICON_MAP = {
  link: <LinkSvg />,
  info: <InfoSvg />,
  check: <CheckSvg />,
  mail: <MailSvg />,
  alert: <AlertSvg />,
} as const;

// ─── Bottom pill toast (dark) ─────────────────────────────────────────────────

const PillToast: FC<{ toast: IToast }> = ({ toast }) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 10);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => dismissToast(toast.id), 280);
    }, toast.duration);

    return () => {
      clearTimeout(showTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration]);

  const icon = toast.icon ? ICON_MAP[toast.icon] : null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "flex max-w-[420px] min-w-[260px] items-center gap-3 rounded-[var(--radius-toast-md,1rem)] bg-[#323232] px-4 py-3 shadow-[0px_4px_20px_rgba(0,0,0,0.28)]",
        "transition-[opacity,transform] duration-[250ms] ease-in-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      )}
    >
      {icon && (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.15)] text-white">
          {icon}
        </span>
      )}
      <span className="flex-1 text-[15px] leading-[22px] font-medium text-white">
        {toast.message}
      </span>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action!.onClick();
            dismissToast(toast.id);
          }}
          className="shrink-0 cursor-pointer text-[13px] font-medium text-[rgba(255,255,255,0.65)] transition-colors hover:text-white"
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
};

// ─── Top banner toast (light colored) ────────────────────────────────────────

const BG_COLOR = {
  success:
    "linear-gradient(90deg, rgba(76,175,80,0.24) 0%, rgba(76,175,80,0.24) 100%), linear-gradient(90deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.85) 100%)",
  error: "#fee2e2",
  info: "#e0f3f1",
} as const;

const ICON_BG_COLOR = {
  success: "rgba(76,175,80,0.16)",
  error: "#f44336",
  info: "#038f7b",
} as const;

const ICON_COLOR = {
  success: "#357a38",
  error: "#ffffff",
  info: "#ffffff",
} as const;

const BannerToast: FC<{ toast: IToast }> = ({ toast }) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 10);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => dismissToast(toast.id), 280);
    }, toast.duration);

    return () => {
      clearTimeout(showTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration]);

  const icon = toast.icon ? ICON_MAP[toast.icon] : null;
  const isDarkAlert = toast.type === "info";
  const bg = isDarkAlert ? "#323232" : BG_COLOR[toast.type];
  const iconBg = isDarkAlert
    ? "rgba(255,255,255,0.2)"
    : ICON_BG_COLOR[toast.type];
  const iconColor = isDarkAlert ? "#ffffff" : ICON_COLOR[toast.type];
  const textColorClass = isDarkAlert ? "text-white" : "text-[rgba(0,0,0,0.87)]";

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        background: bg,
        backdropFilter: isDarkAlert ? undefined : "blur(50px)",
      }}
      className={cn(
        "flex min-h-[72px] max-w-[calc(100vw-32px)] min-w-[600px] items-center gap-4 rounded-[var(--radius-toast-md,1rem)] p-4",
        "transition-[opacity,transform] duration-[250ms] ease-in-out",
        visible ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
      )}
    >
      {icon && (
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p
          className={`text-[18px] leading-5 font-semibold whitespace-nowrap ${textColorClass}`}
        >
          {toast.message}
        </p>
        {toast.subtitle && (
          <p className="mt-0.5 text-[13px] leading-[18px] text-[rgba(0,0,0,0.6)]">
            {toast.subtitle}
          </p>
        )}
      </div>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action!.onClick();
            dismissToast(toast.id);
          }}
          className={`shrink-0 cursor-pointer px-2 py-1.5 text-sm leading-5 font-medium transition-opacity hover:opacity-80 ${textColorClass}`}
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
};

// ─── Container ────────────────────────────────────────────────────────────────

const ToastGroup: FC<{ toasts: IToast[]; position: "top" | "bottom" }> = ({
  toasts,
  position,
}) => {
  if (toasts.length === 0) return null;

  const cls =
    position === "bottom"
      ? "pointer-events-none fixed bottom-6 left-1/2 z-[99999] flex -translate-x-1/2 flex-col items-center gap-2"
      : "pointer-events-none fixed top-4 left-1/2 z-[99999] flex -translate-x-1/2 flex-col items-center gap-2";

  return (
    <div aria-label="Notifications" className={cls}>
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          {position === "bottom" ? (
            <PillToast toast={toast} />
          ) : (
            <BannerToast toast={toast} />
          )}
        </div>
      ))}
    </div>
  );
};

export const ToastContainer: FC = () => {
  const toasts = useToastStore((s) => s.toasts);
  if (typeof document === "undefined") return null;

  const bottom = toasts.filter((t) => t.position === "bottom");
  const top = toasts.filter((t) => t.position === "top");

  return createPortal(
    <>
      <ToastGroup toasts={bottom} position="bottom" />
      <ToastGroup toasts={top} position="top" />
    </>,
    document.body
  );
};
