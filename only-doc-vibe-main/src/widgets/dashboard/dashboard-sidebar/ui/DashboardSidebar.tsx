import { useRef, useEffect, useState, type FC, type ReactNode } from "react";
import { cn } from "@universe-forma/ui-pes";
import LogoSign from "@public/assets/header/Logo.svg?url";
import AvatarIcon from "@public/assets/icons/dashboard/avatar.svg?url";
import MyFilesActiveIcon from "@public/assets/icons/dashboard/my-files.svg?url";
import MyFilesInactiveIcon from "@public/assets/icons/dashboard/my-files-inactive.svg?url";
import ToolsActiveIcon from "@public/assets/icons/dashboard/tools-active.svg?url";
import ToolsInactiveIcon from "@public/assets/icons/dashboard/tools.svg?url";
// import FormsIcon from "@public/assets/icons/dashboard/forms.svg?url";

import { PAGE_LINKS } from "@/shared/constants/page-links";
import { getCurrentLanguage, useTranslation } from "@/shared/lib/translations";
import { navigateThroughURL } from "@/shared/lib/seo/navigate-through-url";
import { useLocalizedHref } from "@/shared/lib/localized-links";
import {
  ArticleIcon,
  HelpIcon,
  LoginIcon,
  LogoutIcon,
  ReceiptIcon,
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

// ── NavItem ───────────────────────────────────────────────────────────────────

interface NavItemProps {
  active: boolean;
  label: string;
  iconSrc: string;
  onClick?: () => void;
  disabled?: boolean;
}

const NavItem: FC<NavItemProps> = ({
  active,
  label,
  iconSrc,
  onClick,
  disabled,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    aria-pressed={active}
    disabled={disabled}
    className={cn(
      "flex min-h-[68px] w-full min-w-0 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-xl px-1 py-[13px] transition-colors",
      active ? "bg-[rgba(0,0,0,0.08)]" : "hover:bg-[rgba(0,0,0,0.04)]",
      disabled && "cursor-not-allowed opacity-50"
    )}
  >
    <img src={iconSrc} alt="" aria-hidden className="h-6 w-6 shrink-0" />
    <span
      className={cn(
        "text-text-primary line-clamp-2 w-full max-w-full text-center text-xs leading-[14px] break-words",
        active ? "font-semibold" : "font-normal"
      )}
    >
      {label}
    </span>
  </button>
);

// ── ProfileMenu ───────────────────────────────────────────────────────────────

interface MenuLinkProps {
  icon: ReactNode;
  label: string;
  href: string;
}

const MenuLink: FC<MenuLinkProps> = ({ icon, label, href }) => (
  <a
    href={href}
    className="text-text-primary flex min-h-14 items-center gap-2 rounded-xl px-3 py-3 text-base leading-[22px] transition-colors hover:bg-[rgba(0,0,0,0.04)]"
  >
    <span className="text-text-secondary shrink-0">{icon}</span>
    <span className="flex-1">{label}</span>
  </a>
);

interface ProfileMenuProps {
  user: {
    email: string;
    fullname?: string;
    firstName?: string;
    lastName?: string;
  } | null;
  onClose: () => void;
}

const ProfileMenu: FC<ProfileMenuProps> = ({ user, onClose }) => {
  const { t } = useTranslation();
  const localizedHref = useLocalizedHref();
  const logout = useLogout();
  const isAuthenticated = useIsUserAuthenticated();

  const displayName =
    user?.fullname ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    null;

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  return (
    <div
      className="absolute start-0 bottom-14 z-50 w-[315px] rounded-2xl bg-white p-2 shadow-[0px_6px_12px_-2px_rgba(0,0,0,0.08),0px_8px_40px_rgba(0,0,0,0.08)]"
      role="menu"
    >
      {/* User info header */}
      <div className="flex min-h-14 flex-col justify-center rounded-xl px-3 py-3">
        {(() => {
          if (displayName) {
            return (
              <p className="text-text-primary overflow-hidden text-base leading-[22px] text-ellipsis">
                {displayName}
              </p>
            );
          }

          if (user?.email) {
            return (
              <p className="text-text-primary overflow-hidden text-base leading-[22px] text-ellipsis">
                {user.email}
              </p>
            );
          }

          return (
            <p className="text-text-secondary overflow-hidden text-base leading-[22px] text-ellipsis">
              {String(t("dashboard.sidebar.guest"))}
            </p>
          );
        })()}
        {displayName && user?.email && (
          <p className="text-text-secondary overflow-hidden text-sm leading-[18px] text-ellipsis">
            {user.email}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        {isAuthenticated && (
          <MenuLink
            icon={<UserIcon size={20} />}
            label={String(t("dashboard.sidebar.myAccount"))}
            href={localizedHref("/dashboard/account")}
          />
        )}
        <MenuLink
          icon={<ArticleIcon size={20} />}
          label={String(t("dashboard.sidebar.blog"))}
          href={localizedHref("/blog")}
        />
        <MenuLink
          icon={<HelpIcon size={20} />}
          label={String(t("dashboard.sidebar.help"))}
          href={localizedHref("/contact-us")}
        />
        <MenuLink
          icon={<ReceiptIcon size={20} />}
          label={String(t("dashboard.sidebar.terms"))}
          href={localizedHref("/terms-and-conditions")}
        />
      </div>

      <div className="px-3 py-1">
        <div className="h-px bg-[var(--color-os-divider)]" />
      </div>

      <div>
        {isAuthenticated ? (
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="text-text-primary flex min-h-14 w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-3 text-base leading-[22px] transition-colors hover:bg-[rgba(0,0,0,0.04)]"
          >
            <LogoutIcon size={20} className="text-text-secondary shrink-0" />
            {String(t("dashboard.sidebar.logout"))}
          </button>
        ) : (
          <a
            href={navigateThroughURL(PAGE_LINKS.LOGIN, getCurrentLanguage())}
            role="menuitem"
            onClick={onClose}
            className="text-text-primary flex min-h-14 w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-3 text-base leading-[22px] transition-colors hover:bg-[rgba(0,0,0,0.04)]"
          >
            <LoginIcon size={20} className="text-text-secondary shrink-0" />
            {String(t("dashboard.sidebar.login"))}
          </a>
        )}
      </div>
    </div>
  );
};

// ── DashboardSidebar ──────────────────────────────────────────────────────────

interface DashboardSidebarProps {
  view?: DashboardView;
}

export const DashboardSidebar: FC<DashboardSidebarProps> = ({
  view = "main",
}) => {
  const { t } = useTranslation();
  const localizedHref = useLocalizedHref();
  const tab = useDashboardStore.use.tab();
  const user = useUserStore.use.user();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);

  const isMain = view === "main";

  const goToTab = (target: EDashboardTab): void => {
    if (isMain) {
      setDashboardTab(target);

      return;
    }

    const hash = target === EDashboardTab.TOOLS ? "#tools" : "";
    window.location.href = `${localizedHref("/dashboard")}${hash}`;
  };

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;

    const handler = (e: MouseEvent) => {
      if (
        menuRef.current?.contains(e.target as Node) ||
        avatarRef.current?.contains(e.target as Node)
      )
        return;

      setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <aside className="my-4 ms-4 flex h-[calc(100dvh-32px)] w-[84px] shrink-0 flex-col items-center gap-6 self-start rounded-2xl px-2 pt-10 pb-6 max-md:hidden">
      <a
        href={localizedHref("/")}
        className="flex h-10 w-10 items-center justify-center"
        aria-label={String(t("dashboard.sidebar.homeAria"))}
      >
        <img src={LogoSign} alt="" className="h-10 w-10" />
      </a>

      <div className="h-px w-10 bg-[var(--color-os-divider)]" />

      <nav className="flex w-full flex-col items-stretch gap-2">
        <NavItem
          active={isMain && tab === EDashboardTab.MY_FILES}
          label={String(t("dashboard.sidebar.myFiles"))}
          iconSrc={
            isMain && tab === EDashboardTab.MY_FILES
              ? MyFilesActiveIcon
              : MyFilesInactiveIcon
          }
          onClick={() => goToTab(EDashboardTab.MY_FILES)}
        />
        <NavItem
          active={isMain && tab === EDashboardTab.TOOLS}
          label={String(t("dashboard.sidebar.tools"))}
          iconSrc={
            isMain && tab === EDashboardTab.TOOLS
              ? ToolsActiveIcon
              : ToolsInactiveIcon
          }
          onClick={() => goToTab(EDashboardTab.TOOLS)}
        />
        {/* TODO: uncomment Forms nav item when Forms feature is ready
        <NavItem
          active={false}
          disabled
          label={String(t("dashboard.sidebar.forms"))}
          iconSrc={FormsIcon}
        />
        */}
      </nav>

      <div
        className="relative mt-auto flex flex-col items-center"
        ref={menuRef}
      >
        {menuOpen && (
          <ProfileMenu user={user} onClose={() => setMenuOpen(false)} />
        )}
        <button
          ref={avatarRef}
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className={cn(
            "flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl p-2 transition-colors",
            view === "account" || menuOpen
              ? "bg-[rgba(0,0,0,0.08)]"
              : "hover:bg-[rgba(0,0,0,0.04)]"
          )}
          aria-label={String(t("dashboard.sidebar.userMenu"))}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <img src={AvatarIcon} alt="" aria-hidden className="h-8 w-8" />
        </button>
      </div>
    </aside>
  );
};
