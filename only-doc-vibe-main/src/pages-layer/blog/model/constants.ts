export const ARTICLES_PER_PAGE = 9;

/**
 * Slugs that are reserved for non-article routes under `/blog/`.
 * If an article uses one of these slugs the build will fail validation.
 */
export const RESERVED_BLOG_SLUGS: readonly string[] = [
  "guides",
  "insights",
  "author",
  "page",
] as const;

/**
 * Average reading speed used to compute reading time when the CMS does not
 * provide an explicit `reading_time` value.
 */
export const READING_WORDS_PER_MINUTE = 200;

/**
 * Synthetic slug used for the "All articles" tab/sidebar entry.
 * Never appears in URLs — `null` category means the unfiltered listing.
 */
export const ALL_ARTICLES_VALUE = "all";
