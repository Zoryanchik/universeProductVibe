import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

import type { APIRoute } from "astro";
import { MAIN_APP_BASE } from "astro:env/client";

import type { availableLocales } from "@/shared/config/locale";
import { defaultLocale } from "@/shared/config/locale";
import {
  getBlogArticleUrl,
  getBlogAuthorUrl,
  getBlogCategoryUrl,
  getBlogHomeUrl,
} from "@/shared/lib/navigation/get-blog-url";

import {
  ARTICLES_PER_PAGE,
  fetchAllArticleSlugs,
  fetchAllAuthorSlugs,
  fetchBlogArticles,
  fetchBlogCategories,
} from "@/pages-layer/blog";
import { getAllServiceRoutes } from "@/pages-layer/seoService";
import { collectTemplateSitemapPaths } from "@/pages-layer/pdfTemplates";

// Static routes that don't come from CMS
const STATIC_ROUTES: readonly string[] = [
  "/",
  "/about-us",
  "/contact-us",
  "/login",
  "/sign-up",
  "/compress-pdf",
  "/pdf-ocr",
  "/translate-pdf",
  "/remove-watermark",
  "/enhance-image",
  "/pdf-to-word",
  "/word-to-pdf",
  "/pdf-to-excel",
  "/excel-to-pdf",
  "/pdf-to-jpg",
  "/jpg-to-pdf",
  "/pdf-to-png",
  "/png-to-pdf",
  "/pdf-to-tiff",
  "/tiff-to-pdf",
  "/pdf-to-azw3",
  "/azw3-to-pdf",
  "/svg-to-pdf",
  "/pdf-summarizer",
  "/terms-and-conditions",
  "/privacy-policy",
  "/cookie-policy",
] as const;

const SITE_URL = MAIN_APP_BASE;
const PAGES_DIR = join(process.cwd(), "pages");

const toDateString = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const getLastmodForRoute = (
  route: string,
  dateByRoute?: Record<string, string | undefined>
): string => {
  const routeDate = dateByRoute?.[route];
  if (routeDate) {
    return routeDate;
  }

  const pageFilename =
    route === "/" ? "index.astro" : `${route.slice(1)}.astro`;
  const pagePath = join(PAGES_DIR, pageFilename);

  if (existsSync(pagePath)) {
    return toDateString(statSync(pagePath).mtime);
  }

  return toDateString(new Date());
};

const generateUrlEntry = ({
  path,
  lastmod,
}: {
  path: string;
  lastmod: string;
}): string => {
  const loc = path === "/" ? SITE_URL : `${SITE_URL}${path}`;

  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
};

const generateSitemap = (
  routes: readonly string[],
  dateByRoute?: Record<string, string | undefined>
): string => {
  const urlEntries = routes.map((route) =>
    generateUrlEntry({
      path: route,
      lastmod: getLastmodForRoute(route, dateByRoute),
    })
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join("\n")}
</urlset>`;
};

const withLeadingSlash = (value: string): string =>
  value.startsWith("/") ? value : `/${value}`;

const collectLocaleBlogPaths = async (
  locale: (typeof availableLocales)[number]
): Promise<{
  paths: string[];
  dateByPath: Record<string, string | undefined>;
}> => {
  const paths: string[] = [getBlogHomeUrl(locale)];
  const dateByPath: Record<string, string | undefined> = {};

  const [homeListing, categories, articles, authors] = await Promise.all([
    fetchBlogArticles({
      locale,
      page: 1,
      pageSize: ARTICLES_PER_PAGE,
    }),
    fetchBlogCategories(locale),
    fetchAllArticleSlugs(locale),
    fetchAllAuthorSlugs(locale),
  ]);

  for (let p = 2; p <= homeListing.pageCount; p++) {
    paths.push(getBlogHomeUrl(locale, p));
  }

  const categoryListings = await Promise.all(
    categories.map(async (category) => {
      const slug = category.slug.replace(/^\//, "");

      return {
        slug,
        listing: await fetchBlogArticles({
          locale,
          page: 1,
          pageSize: ARTICLES_PER_PAGE,
          categorySlug: slug,
        }),
      };
    })
  );

  for (const { slug, listing } of categoryListings) {
    paths.push(getBlogCategoryUrl(locale, slug));
    for (let p = 2; p <= listing.pageCount; p++) {
      paths.push(getBlogCategoryUrl(locale, slug, p));
    }
  }

  for (const article of articles) {
    const articleUrl = getBlogArticleUrl(locale, article.slug);
    paths.push(articleUrl);
    dateByPath[articleUrl] =
      article.updatedAt?.split("T")[0] ?? article.publishedAt?.split("T")[0];
  }

  for (const author of authors) {
    paths.push(getBlogAuthorUrl(locale, author.slug));
  }

  return { paths, dateByPath };
};

const collectBlogPaths = async (): Promise<{
  paths: string[];
  dateByPath: Record<string, string | undefined>;
}> => {
  // Blog content is English-only for now; localized blog routes are not built.
  const { paths, dateByPath } = await collectLocaleBlogPaths(defaultLocale);

  return { paths, dateByPath };
};

export const GET: APIRoute = async () => {
  const [serviceRoutes, blogPaths, templatePaths] = await Promise.all([
    getAllServiceRoutes(),
    collectBlogPaths(),
    collectTemplateSitemapPaths(),
  ]);

  const servicePaths = serviceRoutes
    .filter(
      (route) =>
        route.isDefault &&
        Boolean(route.slug) &&
        Boolean(route.updatedAt || route.publishedAt)
    )
    .map((route) => withLeadingSlash(route.slug));

  const allRoutes = [
    ...new Set([
      ...STATIC_ROUTES,
      ...servicePaths,
      ...blogPaths.paths,
      ...templatePaths,
    ]),
  ];
  const routeDateByPath: Record<string, string | undefined> = {
    ...blogPaths.dateByPath,
    ...Object.fromEntries(
      serviceRoutes.map((route) => [
        withLeadingSlash(route.slug),
        route.updatedAt?.split("T")[0] ?? route.publishedAt?.split("T")[0],
      ])
    ),
  };

  const sitemap = generateSitemap(allRoutes, routeDateByPath);

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
};
