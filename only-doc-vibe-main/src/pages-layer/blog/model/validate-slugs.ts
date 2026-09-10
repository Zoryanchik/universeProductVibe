import { logger } from "@/shared/lib/utils/logger";

import { RESERVED_BLOG_SLUGS } from "./constants";

/**
 * Build-time guard. Logs (and throws in CI) if any article slug collides with
 * a reserved category/author/page slug.
 */
export const validateArticleSlugs = (slugs: ReadonlyArray<string>): void => {
  const collisions = slugs.filter((slug) =>
    RESERVED_BLOG_SLUGS.includes(slug.replace(/^\//, ""))
  );

  if (collisions.length === 0) return;

  const message =
    `Blog: article slug(s) collide with reserved blog routes: ` +
    `${collisions.join(", ")}. Reserved slugs: ${RESERVED_BLOG_SLUGS.join(", ")}.`;

  logger.error(message);

  if (process.env.CI) {
    throw new Error(message);
  }
};

export const isReservedBlogSlug = (slug: string): boolean =>
  RESERVED_BLOG_SLUGS.includes(slug.replace(/^\//, ""));
