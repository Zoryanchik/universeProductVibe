import { WEB_HOST } from "astro:env/client";

import { EPageType } from "../../constants/page-type";
import type {
  FaqSection,
  SchemaGraph,
  SchemaItem,
} from "../../types/seo/schema";
import { generateArticleSchema } from "./schema/generate-article-schema";
import { generateFaqSchema } from "./schema/generate-faq-schema";
import { generateOrganizationSchema } from "./schema/generate-organization-schema";
import { generatePersonSchema } from "./schema/generate-person-schema";
import { generateWebapplicationSchema } from "./schema/generate-webapplication-schema";

export const generateSchema = (
  pathname: string,
  description: string | undefined,
  title: string | undefined,
  pageType: EPageType,
  faqSections?: FaqSection[],
  seoDates?: {
    datePublished?: string;
    dateModified?: string;
  },
  extras?: {
    article?: {
      readonly imageUrl?: string;
      readonly authorName?: string;
      readonly authorUrl?: string;
    };
    person?: {
      readonly name: string;
      readonly imageUrl?: string;
      readonly jobTitle?: string;
      readonly sameAs?: ReadonlyArray<string>;
    };
  }
): SchemaGraph => {
  const graph: SchemaItem[] = [];

  switch (pageType) {
    case EPageType.HOME:
    case EPageType.CONTACT_US:
    case EPageType.ABOUT_US: {
      const faqSchema = generateFaqSchema(faqSections || []);
      const organizationSchema = generateOrganizationSchema({
        path: pathname,
        description: description ?? "",
      });

      // Add organization schema
      if (organizationSchema) {
        graph.push(organizationSchema);
      }

      // Add FAQ schema if available
      if (faqSchema) {
        graph.push(faqSchema);
      }

      return {
        "@context": "https://schema.org",
        "@graph": graph,
      };
    }

    case EPageType.SERVICE: {
      const webapplicationSchema = generateWebapplicationSchema({
        name: title ?? "",
        description: description ?? "",
        url: `https://${WEB_HOST}${pathname}`,
        datePublished: seoDates?.datePublished ?? "2025-01-21",
        dateModified: seoDates?.dateModified,
      });

      if (webapplicationSchema) {
        graph.push(webapplicationSchema);
      }

      const faqSchema = generateFaqSchema(faqSections || []);

      if (faqSchema) {
        graph.push(faqSchema);
      }

      return {
        "@context": "https://schema.org",
        "@graph": graph,
      };
    }
    case EPageType.BLOG_ARTICLE: {
      const articleUrl = `https://${WEB_HOST}${pathname}`;
      graph.push(
        generateArticleSchema({
          url: articleUrl,
          title: title ?? "",
          description: description ?? "",
          imageUrl: extras?.article?.imageUrl,
          datePublished: seoDates?.datePublished ?? "2025-01-21",
          dateModified: seoDates?.dateModified,
          authorName: extras?.article?.authorName,
          authorUrl: extras?.article?.authorUrl,
        })
      );

      return {
        "@context": "https://schema.org",
        "@graph": graph,
      };
    }
    case EPageType.BLOG_AUTHOR: {
      const personUrl = `https://${WEB_HOST}${pathname}`;
      if (extras?.person) {
        graph.push(
          generatePersonSchema({
            url: personUrl,
            name: extras.person.name,
            imageUrl: extras.person.imageUrl,
            jobTitle: extras.person.jobTitle,
            sameAs: extras.person.sameAs,
          })
        );
      }

      return {
        "@context": "https://schema.org",
        "@graph": graph,
      };
    }
    case EPageType.BLOG_HOME:
    case EPageType.BLOG_CATEGORY:
    case EPageType.OTHER:
    default: {
      return {
        "@context": "https://schema.org",
        "@graph": [],
      };
    }
  }
};
