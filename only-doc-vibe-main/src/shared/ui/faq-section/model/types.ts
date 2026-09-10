export interface FaqItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

export interface FaqSectionProps {
  readonly title: string;
  readonly items: readonly FaqItem[];
  readonly className?: string;
  readonly defaultOpenId?: string;
  readonly variant?: "default" | "about-us";
}

export interface FaqItemProps {
  readonly idx: number;
  readonly question: string;
  readonly answer: string;
  /** Shared name so the native <details> group behaves as an exclusive accordion. */
  readonly groupName: string;
  readonly defaultOpen: boolean;
  /** Fired when the item transitions to the open state (analytics hook). */
  readonly onOpen: () => void;
  readonly variant?: "default" | "about-us";
}
