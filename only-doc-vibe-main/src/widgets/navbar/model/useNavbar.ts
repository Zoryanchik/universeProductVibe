import { useEffect, useMemo, useState } from "react";

import type { ELanguages } from "@/shared/constants/languages";
import { availableLocales } from "@/shared/config/locale";
import { useIsInitialRender } from "@/shared/lib/state/useIsInitialRender";
import { navigateThroughURL } from "@/shared/lib/seo/navigate-through-url";
import { getPathWithoutLocale } from "@/shared/lib/navigation/getPathWithoutLocale";
import { EServiceTabId } from "@/shared/constants/service-tabs";

import { useIsUserAuthenticated } from "@/entities/user";

import { useLogout } from "@/features/auth-logout";

import { FEATURES_GROUP_BY_CATEGORY } from "./constants";
import type {
  ILogo,
  INavbarAuth,
  INavbarData,
  INavbarDropdownGroup,
  INavbarDropdownItem,
  INavbarDropdownMap,
  INavbarItem,
  INavbarProps,
} from "./types";

interface IUseNavbarProps {
  // State
  logo: ILogo;
  auth: INavbarAuth;
  loginLink?: INavbarItem;
  logoutLink?: INavbarItem;
  navItems: INavbarItem[];
  isLoggedIn: boolean;
  isMenuOpened: boolean;
  contactUsNavItem: INavbarItem | undefined;
  availableLanguages: ELanguages[];
  toolsMenuMap: INavbarDropdownMap;

  // Actions
  handleLogoClick: () => void;
  setIsMenuOpened: (value: boolean) => void;
  logout: () => void;
}

const MENU_IDS = ["all_tools", "convert_pdf"] as const;
const MENU_LINK_ID_TO_MENU_ID = {
  all_tools: "all_tools",
  convert_pdf: "convert_pdf",
  convert_pdf_page: "convert_pdf",
} as const;

const resolveMenuId = (
  linkId: INavbarItem["link_id"]
): "all_tools" | "convert_pdf" | undefined =>
  MENU_LINK_ID_TO_MENU_ID[linkId as keyof typeof MENU_LINK_ID_TO_MENU_ID];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toStringOrUndefined = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value : undefined;

const getIconData = (
  rawIcon: unknown
): { iconUrl?: string; iconAlt?: string } => {
  if (!rawIcon) return {};

  if (typeof rawIcon === "string") return { iconUrl: rawIcon };

  if (!isRecord(rawIcon)) return {};

  return {
    iconUrl: toStringOrUndefined(rawIcon.url),
    iconAlt: toStringOrUndefined(rawIcon.alternativeText),
  };
};

const normalizeDropdownItem = (
  rawItem: unknown,
  fallbackKey: string
): INavbarDropdownItem | null => {
  if (!isRecord(rawItem)) return null;

  const title =
    toStringOrUndefined(rawItem.title) ??
    toStringOrUndefined(rawItem.label) ??
    toStringOrUndefined(rawItem.name);

  const url =
    toStringOrUndefined(rawItem.url) ?? toStringOrUndefined(rawItem.href);

  if (!title || !url) return null;

  const { iconUrl, iconAlt } = getIconData(
    rawItem.icon ?? rawItem.media ?? rawItem.image
  );
  const badgeLabel =
    toStringOrUndefined(rawItem.badge) ??
    toStringOrUndefined(rawItem.badgeLabel) ??
    toStringOrUndefined(rawItem.badge_text);

  const id =
    toStringOrUndefined(rawItem.custom_link_id) ??
    toStringOrUndefined(rawItem.link_id) ??
    toStringOrUndefined(rawItem.id) ??
    `${fallbackKey}-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return {
    id,
    title,
    url,
    iconUrl,
    iconAlt: iconAlt ?? title,
    badge: badgeLabel ? { label: badgeLabel } : undefined,
  };
};

const normalizeGroup = (
  rawGroup: unknown,
  fallbackKey: string
): INavbarDropdownGroup | null => {
  if (!isRecord(rawGroup)) return null;

  const title =
    toStringOrUndefined(rawGroup.title) ??
    toStringOrUndefined(rawGroup.label) ??
    toStringOrUndefined(rawGroup.name);
  if (!title) return null;

  const rawItems =
    (Array.isArray(rawGroup.link_item) && rawGroup.link_item) ||
    (Array.isArray(rawGroup.items) && rawGroup.items) ||
    (Array.isArray(rawGroup.links) && rawGroup.links) ||
    [];

  const items = rawItems
    .map((item, index) =>
      normalizeDropdownItem(item, `${fallbackKey}-${index}`)
    )
    .filter((item): item is INavbarDropdownItem => item !== null);

  if (!items.length) return null;

  const id =
    toStringOrUndefined(rawGroup.custom_link_id) ??
    toStringOrUndefined(rawGroup.id) ??
    `${fallbackKey}-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return {
    id,
    title,
    items,
  };
};

const STATIC_GROUP_LABELS: Record<string, string> = {
  [EServiceTabId.EDIT_PDF]: "Edit PDF",
  [EServiceTabId.CONVERT_FROM_PDF]: "Convert from PDF",
  [EServiceTabId.CONVERT_TO_PDF]: "Convert to PDF",
  [EServiceTabId.IMAGE_TOOLS]: "Image tools",
  [EServiceTabId.AI_TOOLS]: "AI tools",
};

const buildStaticFallbackGroups = (
  menuId: "all_tools" | "convert_pdf"
): INavbarDropdownGroup[] => {
  const groupsByMenu: Record<"all_tools" | "convert_pdf", string[]> = {
    all_tools: [
      EServiceTabId.EDIT_PDF,
      EServiceTabId.IMAGE_TOOLS,
      EServiceTabId.AI_TOOLS,
    ],
    convert_pdf: [EServiceTabId.CONVERT_TO_PDF, EServiceTabId.CONVERT_FROM_PDF],
  };

  const rawGroups: Array<INavbarDropdownGroup | null> = groupsByMenu[
    menuId
  ].map((category) => {
    const tools = FEATURES_GROUP_BY_CATEGORY[category as EServiceTabId] ?? [];
    if (!tools.length) return null;

    return {
      id: `static-${menuId}-${category}`,
      title: STATIC_GROUP_LABELS[category] ?? category.replaceAll("-", " "),
      items: tools.map((tool) => ({
        id: tool.id,
        title: tool.title,
        url: tool.url,
        iconUrl: tool.icon,
        iconAlt: tool.title,
      })),
    };
  });

  return rawGroups.filter(
    (group): group is INavbarDropdownGroup => group !== null
  );
};

const extractGroups = (
  rawMenuSource: unknown,
  fallbackKey: string
): INavbarDropdownGroup[] => {
  if (!isRecord(rawMenuSource)) return [];

  const nestedMenuSource = rawMenuSource[fallbackKey];
  if (nestedMenuSource && isRecord(nestedMenuSource)) {
    return extractGroups(nestedMenuSource, fallbackKey);
  }

  const rawGroups =
    (Array.isArray(rawMenuSource.tools_links) && rawMenuSource.tools_links) ||
    (Array.isArray(rawMenuSource.menu_groups) && rawMenuSource.menu_groups) ||
    (Array.isArray(rawMenuSource.groups) && rawMenuSource.groups) ||
    (Array.isArray(rawMenuSource.dropdown_groups) &&
      rawMenuSource.dropdown_groups) ||
    [];

  return rawGroups
    .map((group, index) => normalizeGroup(group, `${fallbackKey}-${index}`))
    .filter((group): group is INavbarDropdownGroup => group !== null);
};

export const useNavbar = ({
  navbarData,
  locale,
}: Pick<
  INavbarProps,
  "navbarData" | "locale" | "pathname"
>): IUseNavbarProps => {
  const section = (navbarData as unknown as INavbarData)?.section;
  const navItems = section?.navigation_panel?.nav_link ?? [];
  const logo = section?.logo;

  const auth = section?.auth ?? ({} as INavbarAuth);

  const [isMenuOpened, setIsMenuOpened] = useState(false);
  const [pathname, setPathname] = useState("");

  const isAuthenticated = useIsUserAuthenticated();
  const isInitialRender = useIsInitialRender();

  const logout = useLogout();

  const isLoggedIn = isAuthenticated && !isInitialRender;
  const authLinks = useMemo(() => auth?.link ?? [], [auth?.link]);
  const loginLink = authLinks.find((link) => link.link_id === "login");
  const logoutLink = authLinks.find((link) => link.link_id === "logout");
  const contactUsNavItem = navItems.at(-1);
  const toolsMenuMap = MENU_IDS.reduce<INavbarDropdownMap>((acc, menuId) => {
    const menuItem = navItems.find(
      (item) => resolveMenuId(item.link_id) === menuId
    );
    const menuGroupsFromItem = extractGroups(menuItem, menuId);

    if (menuGroupsFromItem.length) {
      acc[menuId] = menuGroupsFromItem;

      return acc;
    }

    const fallbackGroupFromItems = normalizeGroup(
      {
        title: menuItem?.title ?? menuId.replace("_", " "),
        link_item: menuItem?.link_item,
      },
      `${menuId}-fallback`
    );

    if (fallbackGroupFromItems) {
      acc[menuId] = [fallbackGroupFromItems];

      return acc;
    }

    const menuGroupsFromPanel = extractGroups(
      section?.navigation_panel,
      menuId
    );
    if (menuGroupsFromPanel.length) {
      acc[menuId] = menuGroupsFromPanel;

      return acc;
    }

    const staticFallbackGroups = buildStaticFallbackGroups(menuId);
    if (staticFallbackGroups.length) {
      acc[menuId] = staticFallbackGroups;
    }

    return acc;
  }, {});
  const availableLanguages: ELanguages[] = [
    locale,
    ...(navbarData?.localizations ?? []).map(
      (localization) => localization?.locale as ELanguages
    ),
    ...availableLocales,
  ].filter((lang, index, arr) => arr.indexOf(lang) === index);

  const handleLogoClick = (): void => {
    const homeUrl = navigateThroughURL("/", locale);
    window.location.href = homeUrl;
  };

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  useEffect(() => {
    const header = document.getElementsByTagName("header")[0];
    if (!header) return;

    const path = getPathWithoutLocale(pathname, locale);

    let customBg = "#E8E8E8"; // fallback default color

    if (path === "/about-us") customBg = "#f5f5f5ff";
    else if (path !== "/") customBg = "#FFFFFF";

    header.style.setProperty("--header-base-bg", customBg);
  }, [pathname, locale]);

  useEffect(() => {
    const header = document.getElementsByTagName("header")[0];
    if (!header) return;

    if (isMenuOpened) header.setAttribute("data-menu-open", "");
    else header.removeAttribute("data-menu-open");
  }, [isMenuOpened]);

  useEffect(() => {
    if (isMenuOpened) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("no-scroll");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("no-scroll");
    }

    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("no-scroll");
    };
  }, [isMenuOpened]);

  useEffect(() => {
    const header = document.getElementsByTagName("header")?.[0];

    const onScroll = () => {
      header?.toggleAttribute("data-scrolled", window.scrollY > 0);
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return {
    // State
    logo,
    auth,
    loginLink,
    logoutLink,
    navItems: navItems.slice(0, -1), // returns navigation list without contact us page which is last item in arr
    isLoggedIn,
    isMenuOpened,
    contactUsNavItem,
    availableLanguages,
    toolsMenuMap,

    // Actions
    handleLogoClick,
    setIsMenuOpened,
    logout,
  };
};
