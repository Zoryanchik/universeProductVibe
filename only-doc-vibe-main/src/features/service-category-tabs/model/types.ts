/** Represents a single tab item in the service category tabs */
export interface ITabItem {
  /** Unique identifier for the tab */
  readonly id: string;
  /** Display label for the tab */
  readonly label: string;
}

/** Props for the ServiceCategoryTabs component */
export interface IServiceCategoryTabsProps {
  /** Array of tab items to display */
  readonly tabs: readonly ITabItem[];
  /** ID of the currently active tab */
  readonly activeTabId: string;
  /** Callback fired when a tab is selected */
  readonly onTabChange: (tabId: string) => void;
  /** Additional CSS classes for the container */
  readonly className?: string;
}

/** Props for a single Tab component */
export interface ITabProps {
  /** Unique identifier for the tab */
  readonly id: string;
  /** Display label for the tab */
  readonly label: string;
  /** Whether this tab is currently active */
  readonly isActive: boolean;
  /** Callback fired when the tab is clicked */
  readonly onClick: () => void;
}
