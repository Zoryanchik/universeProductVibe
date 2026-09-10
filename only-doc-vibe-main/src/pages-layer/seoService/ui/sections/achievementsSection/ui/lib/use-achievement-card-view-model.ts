import type { IAchievementCard } from "../../model/types";

/**
 * Get document hover transform classes based on card position and document index
 *
 * This function calculates the animation direction for documents when hovering:
 * - Left card (uploads): documents spread left
 * - Center card (edits): documents only move up
 * - Right card (conversions): documents spread right
 *
 * @param cardId - The unique identifier of the card
 * @param docIndex - The index of the document (0 = right, 1 = middle, 2 = left)
 * @returns Tailwind CSS classes for hover transform
 */
export const getDocumentHoverTransform = (
  cardId: string,
  docIndex: number
): string => {
  // Document order: [0] = right doc, [1] = middle doc, [2] = left doc
  if (cardId === "uploads") {
    // Left card - documents spread left
    if (docIndex === 0)
      return "group-hover:-translate-x-3 group-hover:-translate-y-8";

    if (docIndex === 1)
      return "group-hover:-translate-x-2 group-hover:-translate-y-6";

    if (docIndex === 2)
      return "group-hover:-translate-x-1 group-hover:-translate-y-4";
  } else if (cardId === "edits") {
    // Center card - documents only move up
    if (docIndex === 0) return "group-hover:-translate-y-8";

    if (docIndex === 1) return "group-hover:-translate-y-6";

    if (docIndex === 2) return "group-hover:-translate-y-4";
  } else if (cardId === "conversions") {
    // Right card - documents spread right
    if (docIndex === 0)
      return "group-hover:translate-x-3 group-hover:-translate-y-8";

    if (docIndex === 1)
      return "group-hover:translate-x-2 group-hover:-translate-y-6";

    if (docIndex === 2)
      return "group-hover:translate-x-1 group-hover:-translate-y-4";
  }

  // Default fallback
  return "group-hover:-translate-y-4";
};

/**
 * Calculate inline styles for document positioning
 *
 * @param x - X coordinate in pixels
 * @param y - Y coordinate in pixels
 * @returns Style object with positioning and shadow
 */
export const getDocumentStyles = (
  x: number,
  y: number
): React.CSSProperties => ({
  left: `${x}px`,
  top: `${y}px`,
  filter: "drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.16))",
});

/**
 * Get base card styles
 */
export const getBaseCardStyles = (): React.CSSProperties => ({
  backgroundColor: "var(--color-achievement-card-base)",
});

/**
 * Get colored background overlay styles
 *
 * @param backgroundColor - The background color from card data
 * @returns Style object with background color
 */
export const getColoredBackgroundStyles = (
  backgroundColor: string
): React.CSSProperties => ({
  backgroundColor,
});

/**
 * Get icon container styles
 */
export const getIconContainerStyles = (): React.CSSProperties => ({
  backgroundColor: "rgba(255, 255, 255, 0.35)",
});

/**
 * Get icon color styles
 *
 * @param iconColor - The icon color from card data
 * @returns Style object with color
 */
export const getIconColorStyles = (iconColor: string): React.CSSProperties => ({
  color: iconColor,
});

/**
 * Get text color styles for labels and values
 */
export const getTextColorStyles = (): React.CSSProperties => ({
  color: "rgba(0, 0, 0, 0.87)",
});

/**
 * Get folder image styles
 */
export const getFolderStyles = (): React.CSSProperties => ({
  width: "324px",
  height: "auto",
});

/**
 * Prepare view model for AchievementCard component
 * Transforms card data into all necessary props for rendering
 *
 * @param card - The achievement card data
 * @returns View model with all computed properties and helpers
 */
export interface AchievementCardViewModel {
  readonly card: IAchievementCard;
  readonly getDocumentHoverClass: (docIndex: number) => string;
  readonly getDocumentStyle: (x: number, y: number) => React.CSSProperties;
  readonly baseCardStyle: React.CSSProperties;
  readonly coloredBackgroundStyle: React.CSSProperties;
  readonly iconContainerStyle: React.CSSProperties;
  readonly iconColorStyle: React.CSSProperties;
  readonly textColorStyle: React.CSSProperties;
  readonly folderStyle: React.CSSProperties;
}

export const useAchievementCardViewModel = (
  card: IAchievementCard
): AchievementCardViewModel => {
  return {
    card,
    getDocumentHoverClass: (docIndex: number) =>
      getDocumentHoverTransform(card.id, docIndex),
    getDocumentStyle: getDocumentStyles,
    baseCardStyle: getBaseCardStyles(),
    coloredBackgroundStyle: getColoredBackgroundStyles(card.backgroundColor),
    iconContainerStyle: getIconContainerStyles(),
    iconColorStyle: getIconColorStyles(card.iconColor),
    textColorStyle: getTextColorStyles(),
    folderStyle: getFolderStyles(),
  };
};
