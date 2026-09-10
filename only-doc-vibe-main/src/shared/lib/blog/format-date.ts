import type { ELanguages } from "../../constants/languages";

/**
 * Format a date string (ISO or any Date-parsable value) for blog UI.
 * Defaults to medium date style (e.g., "Jan 15, 2024").
 */
export const formatBlogDate = (
  value: string | Date | undefined | null,
  locale: ELanguages,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }
): string => {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    return new Intl.DateTimeFormat("en", options).format(date);
  }
};
