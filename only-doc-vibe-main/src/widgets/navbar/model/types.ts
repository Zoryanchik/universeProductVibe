import type { components } from "@/shared/api/cms/cms-schema";
import type { ELanguages } from "@/shared/constants/languages";

export interface INavbarProps {
  readonly navbarData: components["schemas"]["NavbarResponse"]["data"];
  readonly locale: ELanguages;
  readonly pathname: string;
  readonly pageLocalizations?: ELanguages[];
  readonly pdfTemplatesLabel: string;
}

export interface ILogo {
  readonly id: number;
  readonly url: string;
  readonly alternativeText: string | null;
  readonly width: number;
  readonly height: number;
}

export interface INavbarBadge {
  readonly label: string;
}

export interface INavbarDropdownItem {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly iconUrl?: string;
  readonly iconAlt?: string;
  readonly badge?: INavbarBadge;
}

export interface INavbarDropdownGroup {
  readonly id: string;
  readonly title: string;
  readonly items: INavbarDropdownItem[];
}

export interface INavbarDropdownMap {
  all_tools?: INavbarDropdownGroup[];
  convert_pdf?: INavbarDropdownGroup[];
}

export interface INavbarSection {
  readonly logo: ILogo;
  readonly auth: INavbarAuth;
  readonly navigation_panel: INavbarPanel;
}

export interface INavbarData {
  readonly section: INavbarSection;
}

export interface INavbarPanel {
  readonly id: number;
  readonly nav_link: INavbarItem[];
}

export interface INavbarAuth {
  readonly id: number;
  readonly link: INavbarItem[];
}

export interface INavbarItem {
  readonly id: number;
  readonly title: string;
  readonly url: string;
  readonly link_id:
    | "logout"
    | "all_tools"
    | "pdf_viewer"
    | "convert_pdf"
    | "login"
    | "dashboard"
    | "blog"
    | "about_us"
    | "subscription_terms"
    | "terms_and_conditions"
    | "privacy_policy"
    | "cookie_policy"
    | "contact_us"
    | "convert_pdf_page";
  readonly custom_link_id: string;
  readonly icon?: ILogo | null;
  readonly badge?: string | null;
  readonly link_item?: INavbarItem[];
  readonly tools_links?: Array<{
    id: number;
    title: string;
    link_item?: INavbarItem[];
  }>;
  readonly menu_groups?: Array<{
    id: number;
    title: string;
    link_item?: INavbarItem[];
  }>;
}
