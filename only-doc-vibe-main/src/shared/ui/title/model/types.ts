export type TitleLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type TitleVariant =
  | "desktop-title-1"
  | "desktop-title-2"
  | "desktop-title-3"
  | "desktop-title-4"
  | "desktop-title-5"
  | "desktop-title-6"
  | "mobile-title-1"
  | "mobile-title-2"
  | "mobile-title-3"
  | "mobile-title-4"
  | "mobile-title-5"
  | "mobile-title-6"
  | "leading-desktop"
  | "leading-mobile";

export interface TitleProps {
  readonly level?: TitleLevel;
  readonly variant?: TitleVariant;
  readonly mobileVariant?: TitleVariant;
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly align?: "left" | "center" | "right";
  readonly id?: string;
}
