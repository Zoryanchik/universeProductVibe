/**
 * Interface representing the structure of a MainPage Global Widget,
 * as returned from the CMS (Strapi) for the navbar/global_widgets usage.
 */
export interface IMainPageGlobalWidget {
  id: number;
  documentId: string;
  title: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  publishedAt: string; // ISO date string
  locale: string;
  widget: IWidgetNavbarComponent[];
  localizations: ILocalization[];
}

export interface IWidgetNavbarComponent {
  __component: "widget.navbar";
  id: number;
  title: string;
  navigation_panel: ICommonNavigationMenuComponent;
}

export interface ICommonNavigationMenuComponent {
  id: number;
  all_tools: string;
  viewer: string;
  convert: string;
}

export interface ILocalization {
  id?: number;
  documentId?: string;
  title?: string;
  widget?: IWidgetNavbarComponent[];
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
  publishedAt?: string; // ISO date string
  createdBy?: {
    id?: number;
    documentId?: string;
  };
  updatedBy?: {
    id?: number;
    documentId?: string;
  };
  locale?: string;
  localizations?: Array<{
    id?: number;
    documentId?: string;
  }>;
}
