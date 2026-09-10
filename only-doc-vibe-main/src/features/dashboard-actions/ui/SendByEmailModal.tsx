import { useState, type FC, type FormEvent } from "react";
import { cn } from "@universe-forma/ui-pes";

import { MailFilledIcon } from "@/shared/ui/dashboard-icons";
import { BaseModal } from "@/shared/ui/base-modal/BaseModal";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import {
  closeModal,
  useCurrentModalOptions,
} from "@/shared/lib/modals/modals-store";
import { showToast } from "@/shared/lib/toast/toast-store";
import { useTranslation } from "@/shared/lib/translations";
import type { IDashboardSendByEmailModalOptions } from "@/shared/lib/modals/dashboard-modal-options";

import { useDashboardActions } from "../model/use-dashboard-actions";

export type { IDashboardSendByEmailModalOptions } from "@/shared/lib/modals/dashboard-modal-options";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

const Field: FC<FieldProps> = ({ label, children }) => (
  <div>
    <label className="mb-1 block text-[13px] leading-[14px] font-light text-[rgba(0,0,0,0.6)]">
      {label}
    </label>
    {children}
  </div>
);

export const DashboardSendByEmailModal: FC = () => {
  const { t } = useTranslation();
  const options = useCurrentModalOptions(
    EModalsTypes.DASHBOARD_SEND_BY_EMAIL
  ) as IDashboardSendByEmailModalOptions | null;
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const { sendByEmail } = useDashboardActions();

  if (!options) return null;

  const isEmailValid = EMAIL_REGEX.test(email);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || !isEmailValid) return;

    setBusy(true);
    const ok = await sendByEmail({
      fileId: options.fileId,
      filename: options.filename,
      recipientEmail: email,
      message,
    });
    setBusy(false);
    if (ok) {
      setSent(true);
      closeModal(EModalsTypes.DASHBOARD_SEND_BY_EMAIL);
      showToast(
        String(
          t("dashboard.email.sentMessage", {
            filename: options.filename,
            email,
          })
        ),
        { type: "success", icon: "mail", position: "top", duration: 5000 }
      );
    } else {
      showToast(String(t("dashboard.toast.emailFailed")), {
        type: "error",
        icon: "alert",
        position: "top",
        duration: 5000,
        subtitle: String(
          t("dashboard.email.errorSubtitle", {
            filename: options.filename,
            email,
          })
        ),
      });
    }
  };

  return (
    <BaseModal
      modalType={EModalsTypes.DASHBOARD_SEND_BY_EMAIL}
      headerTitle={String(t("dashboard.email.title"))}
      headerSubtitle={options.filename}
      headerAlign="left"
      className="w-full max-w-[592px]"
    >
      <form onSubmit={handleSubmit}>
        {/* Fields */}
        <div className="flex flex-col gap-6 px-6 pb-6">
          <Field label={String(t("dashboard.email.recipientLabel"))}>
            <div className="flex min-h-[56px] items-center gap-2 rounded-xl border border-[rgba(0,0,0,0.14)] px-3 py-4 focus-within:border-[var(--color-primary)]">
              <MailFilledIcon
                size={18}
                className="shrink-0 text-[var(--color-primary)]"
              />
              <input
                type="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={String(t("dashboard.email.recipientPlaceholder"))}
                className="text-text-primary min-w-0 flex-1 bg-transparent text-base leading-6 font-light outline-none placeholder:text-[rgba(0,0,0,0.6)]"
              />
            </div>
          </Field>

          <Field label={String(t("dashboard.email.messageLabel"))}>
            <div className="flex min-h-[120px] items-start rounded-xl border border-[rgba(0,0,0,0.14)] px-3 py-4 focus-within:border-[var(--color-primary)]">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={String(t("dashboard.email.messagePlaceholder"))}
                rows={4}
                className="text-text-primary min-w-0 flex-1 resize-none bg-transparent text-base leading-6 font-light outline-none placeholder:text-[rgba(0,0,0,0.6)]"
              />
            </div>
          </Field>
        </div>

        {/* Footer */}
        <div className="px-5 pt-3 pb-5">
          <button
            type="submit"
            disabled={busy || !isEmailValid}
            className={cn(
              "flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-base leading-6 font-medium text-black transition-colors",
              "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark,#026d5e)]",
              (busy || !isEmailValid) && "cursor-not-allowed opacity-50"
            )}
          >
            <MailFilledIcon size={20} />
            {String(
              sent ? t("dashboard.email.sent") : t("dashboard.email.send")
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};
