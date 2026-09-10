import { useEffect, useRef, useState, type FC, type ReactNode } from "react";
import { cn } from "@universe-forma/ui-pes";
import AvatarIcon from "@public/assets/icons/dashboard/avatar.svg?url";
import MyFilesActiveIcon from "@public/assets/icons/dashboard/my-files.svg?url";
import MyFilesInactiveIcon from "@public/assets/icons/dashboard/my-files-inactive.svg?url";
import ToolsActiveIcon from "@public/assets/icons/dashboard/tools-active.svg?url";
import ToolsInactiveIcon from "@public/assets/icons/dashboard/tools.svg?url";

import { PAGE_LINKS } from "@/shared/constants/page-links";
import { useLocalizedHref } from "@/shared/lib/localized-links";
import { getCurrentLanguage, useTranslation } from "@/shared/lib/translations";
import { navigateThroughURL } from "@/shared/lib/seo/navigate-through-url";
import {
  ArticleIcon,
  HelpIcon,
  LoginIcon,
  LogoutIcon,
  ReceiptIcon,
  UploadIcon,
  UserIcon,
} from "@/shared/ui/dashboard-icons";

import { useIsUserAuthenticated, useUserStore } from "@/entities/user";
import {
  type DashboardView,
  EDashboardTab,
  setDashboardTab,
  useDashboardStore,
} from "@/entities/documents";

import { useLogout } from "@/features/auth-logout";
import { useDashboardUpload } from "@/features/dashboard-upload";

interface BottomTabProps {
  active: boolean;
  label: string;
  iconSrc: string;
  onClick: () => void;
}

const BottomTab: FC<BottomTabProps> = ({ active, label, iconSrc, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    aria-pressed={active}
    className="flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden px-1 py-2"
  >
    <img
      src={iconSrc}
      alt=""
      aria-hidden
      className={cn(
        "h-6 w-6 shrink-0 transition-opacity",
        !active && "opacity-60"
      )}
    />
    <span
      className={cn(
        "line-clamp-2 w-full max-w-full text-center text-[11px] leading-[13px] break-words",
        active ? "text-text-primary font-semibold" : "text-text-secondary"
      )}
    >
      {label}
    </span>
  </button>
);

interface MobileMenuLinkProps {
  icon: ReactNode;
  label: string;
  href: string;
  onClick: () => void;
}

const MobileMenuLink: FC<MobileMenuLinkProps> = ({
  icon,
  label,
  href,
  onClick,
}) => (
  <a
    href={href}
    onClick={onClick}
    className="text-text-primary flex min-h-14 items-center gap-2 rounded-xl px-3 py-3 text-base leading-[22px] transition-colors hover:bg-[rgba(0,0,0,0.04)]"
  >
    <span className="text-text-secondary shrink-0">{icon}</span>
    <span className="flex-1">{label}</span>
  </a>
);

interface DashboardBottomNavProps {
  view?: DashboardView;
}

export const DashboardBottomNav: FC<DashboardBottomNavProps> = ({
  view = "main",
}) => {
  const { t } = useTranslation();
  const localizedHref = useLocalizedHref();
  const tab = useDashboardStore.use.tab();
  const user = useUserStore.use.user();
  const isAuthenticated = useIsUserAuthenticated();
  const logout = useLogout();
  const { upload, inFlight } = useDashboardUpload();
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isMain = view === "main";

  useEffect(() => {
    if (!menuOpen) return;

    const handler = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", handler);

    return () => document.removeEventListener("keydown", handler);
  }, [menuOpen]);

  const closeMenu = (): void => setMenuOpen(false);

  const goToTab = (target: EDashboardTab): void => {
    closeMenu();

    if (isMain) {
      setDashboardTab(target);

      return;
    }

    const hash = target === EDashboardTab.TOOLS ? "#tools" : "";
    window.location.href = `${localizedHref("/dashboard")}${hash}`;
  };

  const handleLogout = async (): Promise<void> => {
    closeMenu();
    await logout();
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = event.target.files;
          if (!files) return;

          void upload(Array.from(files));
          event.target.value = "";
        }}
      />

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label={String(t("dashboard.actions.close"))}
            onClick={closeMenu}
            className="fixed inset-0 z-40 bg-[rgba(0,0,0,0.3)] md:hidden"
          />
          <div className="fixed inset-x-3 bottom-[calc(72px+env(safe-area-inset-bottom))] z-50 rounded-2xl bg-white p-2 shadow-[0px_6px_12px_-2px_rgba(0,0,0,0.08),0px_8px_40px_rgba(0,0,0,0.08)] md:hidden">
            <div className="flex min-h-14 flex-col justify-center rounded-xl px-3 py-3">
              <p className="text-text-primary overflow-hidden text-base leading-[22px] text-ellipsis">
                {user?.fullname ||
                  user?.email ||
                  String(t("dashboard.sidebar.guest"))}
              </p>
            </div>

            <div className="flex flex-col gap-0.5">
              {isAuthenticated && (
                <MobileMenuLink
                  icon={<UserIcon size={20} />}
                  label={String(t("dashboard.sidebar.myAccount"))}
                  href={localizedHref("/dashboard/account")}
                  onClick={closeMenu}
                />
              )}
              <MobileMenuLink
                icon={<ArticleIcon size={20} />}
                label={String(t("dashboard.sidebar.blog"))}
                href={localizedHref("/blog")}
                onClick={closeMenu}
              />
              <MobileMenuLink
                icon={<HelpIcon size={20} />}
                label={String(t("dashboard.sidebar.help"))}
                href={localizedHref("/contact-us")}
                onClick={closeMenu}
              />
              <MobileMenuLink
                icon={<ReceiptIcon size={20} />}
                label={String(t("dashboard.sidebar.terms"))}
                href={localizedHref("/terms-and-conditions")}
                onClick={closeMenu}
              />
            </div>

            <div className="px-3 py-1">
              <div className="h-px bg-[var(--color-os-divider)]" />
            </div>

            {isAuthenticated ? (
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="text-text-primary flex min-h-14 w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-3 text-base leading-[22px] transition-colors hover:bg-[rgba(0,0,0,0.04)]"
              >
                <LogoutIcon
                  size={20}
                  className="text-text-secondary shrink-0"
                />
                {String(t("dashboard.sidebar.logout"))}
              </button>
            ) : (
              <a
                href={navigateThroughURL(
                  PAGE_LINKS.LOGIN,
                  getCurrentLanguage()
                )}
                role="menuitem"
                onClick={closeMenu}
                className="text-text-primary flex min-h-14 w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-3 text-base leading-[22px] transition-colors hover:bg-[rgba(0,0,0,0.04)]"
              >
                <LoginIcon size={20} className="text-text-secondary shrink-0" />
                {String(t("dashboard.sidebar.login"))}
              </a>
            )}
          </div>
        </>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-[var(--color-os-divider)] bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label={String(t("dashboard.sidebar.tools"))}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={inFlight > 0}
          aria-label={String(t("dashboard.header.upload"))}
          className="absolute -top-6 left-1/2 z-10 flex h-14 w-14 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full bg-[var(--color-primary)] text-black shadow-[0px_6px_16px_rgba(0,0,0,0.24)] ring-4 ring-white transition-opacity disabled:opacity-50"
        >
          <UploadIcon size={24} />
        </button>

        <div className="flex flex-1 items-stretch">
          <BottomTab
            active={isMain && tab === EDashboardTab.MY_FILES && !menuOpen}
            label={String(t("dashboard.sidebar.myFiles"))}
            iconSrc={
              isMain && tab === EDashboardTab.MY_FILES
                ? MyFilesActiveIcon
                : MyFilesInactiveIcon
            }
            onClick={() => goToTab(EDashboardTab.MY_FILES)}
          />
          <BottomTab
            active={isMain && tab === EDashboardTab.TOOLS && !menuOpen}
            label={String(t("dashboard.sidebar.tools"))}
            iconSrc={
              isMain && tab === EDashboardTab.TOOLS
                ? ToolsActiveIcon
                : ToolsInactiveIcon
            }
            onClick={() => goToTab(EDashboardTab.TOOLS)}
          />
        </div>

        <div className="w-16 shrink-0" aria-hidden />

        <div className="flex flex-1 items-stretch">
          <BottomTab
            active={menuOpen || view === "account"}
            label={String(t("dashboard.sidebar.account"))}
            iconSrc={AvatarIcon}
            onClick={() => setMenuOpen((value) => !value)}
          />
        </div>
      </nav>
    </>
  );
};
