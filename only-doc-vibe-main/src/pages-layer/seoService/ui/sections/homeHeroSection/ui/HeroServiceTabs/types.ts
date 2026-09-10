export interface IServiceTab {
  readonly id: string;
  readonly label: string;
  readonly iconUrl?: string;
}

export interface IHeroServiceTabsProps {
  readonly tabs: readonly IServiceTab[];
  readonly onTabChange?: (tabId: string) => void;
  readonly defaultTabId?: string;
}
