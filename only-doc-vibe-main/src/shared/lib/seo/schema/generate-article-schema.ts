import { WEB_HOST } from "astro:env/client";

import type { ArticleSchema } from "../../../types/seo/schema";

interface ArticleSchemaInput {
  readonly url: string;
  readonly title: string;
  readonly description?: string;
  readonly imageUrl?: string;
  readonly datePublished: string;
  readonly dateModified?: string;
  readonly authorName?: string;
  readonly authorUrl?: string;
}

const PUBLISHER_LOGO = "https://cms.onlydoc.app/uploads/onlydoc_logo_dark.png";

const resolveAuthorUrl = (authorUrl?: string): string | undefined => {
  if (!authorUrl) return undefined;

  if (authorUrl.startsWith("http")) return authorUrl;

  return `https://${WEB_HOST}${authorUrl}`;
};

export const generateArticleSchema = ({
  url,
  title,
  description,
  imageUrl,
  datePublished,
  dateModified,
  authorName,
  authorUrl,
}: ArticleSchemaInput): ArticleSchema => ({
  "@type": "BlogPosting",
  headline: title,
  description,
  image: imageUrl,
  datePublished,
  dateModified,
  author: authorName
    ? {
        "@type": "Person",
        name: authorName,
        url: resolveAuthorUrl(authorUrl),
      }
    : undefined,
  publisher: {
    "@type": "Organization",
    name: "OnlyDoc",
    logo: { "@type": "ImageObject", url: PUBLISHER_LOGO },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": url,
  },
});
