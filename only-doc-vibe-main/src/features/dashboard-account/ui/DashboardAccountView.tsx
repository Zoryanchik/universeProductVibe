import { useEffect, useState, type FC } from "react";
import { cn } from "@universe-forma/ui-pes";

import { apiHttpClient } from "@/shared/api/api-http-client";
import { API_ROUTES } from "@/shared/api/api-routes";
import { availableLocales } from "@/shared/config/locale";
import type { ELanguages } from "@/shared/constants/languages";
import { LANGUAGES_LABELS } from "@/shared/constants/languages";
import { showToast } from "@/shared/lib/toast/toast-store";
import { useTranslation, getCurrentLanguage } from "@/shared/lib/translations";
import { navigateThroughURL } from "@/shared/lib/seo/navigate-through-url";
import { CheckIcon, EditIcon } from "@/shared/ui/dashboard-icons";

import { useUserStore } from "@/entities/user";

const SectionTitle: FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-text-secondary text-sm leading-[18px] font-semibold tracking-wide uppercase">
    {children}
  </h2>
);

interface DashboardAccountViewProps {
  /** Page locale resolved on the server — keeps the language list deterministic across SSR/CSR. */
  readonly lang?: string;
}

export const DashboardAccountView: FC<DashboardAccountViewProps> = ({
  lang,
}) => {
  const { t } = useTranslation();
  const user = useUserStore.use.user();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // The user store is hydrated synchronously from localStorage on the client but
  // is empty during SSR, so defer reading it until after mount to avoid a
  // hydration mismatch.
  const accountUser = mounted ? user : null;
  const currentLang = (lang ?? getCurrentLanguage()) as ELanguages;

  const handleChangePassword = async (): Promise<void> => {
    if (!user?.email || sending) return;

    setSending(true);
    try {
      await apiHttpClient.post(API_ROUTES.AUTH_RECOVER_PASSWORD, {
        email: user.email,
      });
      setSent(true);
      showToast(String(t("dashboard.myAccount.passwordEmailSent")), {
        type: "success",
        position: "bottom",
      });
    } catch {
      showToast(String(t("dashboard.myAccount.passwordEmailError")), {
        type: "error",
        position: "bottom",
      });
    } finally {
      setSending(false);
    }
  };

  const handleSelectLanguage = (locale: ELanguages): void => {
    if (locale === currentLang) return;

    window.location.href = navigateThroughURL("/dashboard/account", locale);
  };

  const getPasswordButtonLabel = (): string => {
    if (sending) return String(t("dashboard.myAccount.sending"));

    return String(t("dashboard.myAccount.changePassword"));
  };

  return (
    <div className="px-10 pt-8 pb-10 max-md:px-4 max-md:pt-6 max-md:pb-6">
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8">
        <h1 className="text-text-primary text-[28px] leading-9 font-bold max-md:text-2xl">
          {String(t("dashboard.myAccount.title"))}
        </h1>

        {/* ── Account information ── */}
        <section className="flex flex-col gap-3">
          <SectionTitle>
            {String(t("dashboard.myAccount.accountInformation"))}
          </SectionTitle>

          <div className="divide-y divide-[var(--color-os-divider)] overflow-hidden rounded-2xl border border-[var(--color-os-divider)]">
            {/* Email (read-only) */}
            <div className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="text-text-secondary mb-1 text-[13px] leading-[14px]">
                  {String(t("dashboard.myAccount.email"))}
                </p>
                {mounted ? (
                  <p className="text-text-primary truncate text-base leading-6 font-semibold">
                    {accountUser?.email ?? "—"}
                  </p>
                ) : (
                  <span className="block h-6 w-48 max-w-full animate-pulse rounded bg-[rgba(0,0,0,0.06)]" />
                )}
              </div>
            </div>

            {/* Password */}
            <div className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="text-text-secondary mb-1 text-[13px] leading-[14px]">
                  {String(t("dashboard.myAccount.password"))}
                </p>
                {accountUser?.googleAuth ? (
                  <p className="text-text-secondary text-sm leading-[18px]">
                    {String(t("dashboard.myAccount.googleManaged"))}
                  </p>
                ) : (
                  <p className="text-text-primary text-base leading-6 font-semibold tracking-[0.15em]">
                    ••••••••
                  </p>
                )}
              </div>

              {!accountUser?.googleAuth && (
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={sending || sent || !accountUser?.email}
                  className={cn(
                    "text-text-primary flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-[rgba(0,0,0,0.04)] px-3 py-2 text-sm leading-5 font-medium transition-colors hover:bg-[rgba(0,0,0,0.08)]",
                    (sending || sent || !accountUser?.email) &&
                      "cursor-not-allowed opacity-50"
                  )}
                >
                  <EditIcon size={16} />
                  {getPasswordButtonLabel()}
                </button>
              )}
            </div>
          </div>

          {!accountUser?.googleAuth && (
            <p
              className={cn(
                "text-sm leading-[18px]",
                sent ? "text-[var(--color-primary)]" : "text-text-secondary"
              )}
            >
              {String(
                sent
                  ? t("dashboard.myAccount.passwordEmailSent")
                  : t("dashboard.myAccount.changePasswordDescription")
              )}
            </p>
          )}
        </section>

        <div className="h-px bg-[var(--color-os-divider)]" />

        {/* ── Language ── */}
        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <SectionTitle>
              {String(t("dashboard.myAccount.language"))}
            </SectionTitle>
            <span className="text-text-secondary text-sm leading-[18px]">
              {String(t("dashboard.myAccount.languageDescription"))}
            </span>
          </div>

          <ul className="flex flex-col gap-0.5">
            {availableLocales.map((locale) => {
              const isActive = locale === currentLang;

              return (
                <li key={locale}>
                  <button
                    type="button"
                    onClick={() => handleSelectLanguage(locale)}
                    aria-pressed={isActive}
                    className={cn(
                      "flex min-h-12 w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-start transition-colors",
                      isActive
                        ? "bg-[var(--color-primary-opacity-8)]"
                        : "hover:bg-[rgba(0,0,0,0.04)]"
                    )}
                  >
                    <span className="text-text-primary flex-1 text-base leading-[22px]">
                      {LANGUAGES_LABELS[locale]}
                    </span>
                    {isActive && (
                      <span className="text-[var(--color-primary)]">
                        <CheckIcon />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
};
