/** Default reading speed used when CMS does not provide an explicit `reading_time`. */
const DEFAULT_WORDS_PER_MINUTE = 200;

/**
 * Estimate reading time in whole minutes from raw markdown / HTML / plain text.
 * Always returns at least 1 minute.
 */
export const calculateReadingTime = (
  text: string | undefined | null,
  wordsPerMinute: number = DEFAULT_WORDS_PER_MINUTE
): number => {
  if (!text) return 1;

  // Strip code fences, then markdown / HTML noise so we count actual words.
  const stripped = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[#*_>~`-]/g, " ");

  const wordCount = stripped
    .split(/\s+/)
    .filter((token) => token.trim().length > 0).length;

  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};
