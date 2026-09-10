import type { WebapplicationSchema } from "../../../types/seo/schema";

interface WebapplicationSchemaConfig {
  name: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
}

export const generateWebapplicationSchema = ({
  name,
  description,
  url,
  datePublished,
  dateModified,
}: WebapplicationSchemaConfig): WebapplicationSchema => ({
  "@type": "WebApplication",
  name,
  description,
  url,
  applicationCategory: "Utility",
  datePublished,
  ...(dateModified ? { dateModified } : {}),
  author: {
    "@type": "Organization",
    name: "OnlyDoc",
    url,
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "45",
  },
  offers: {
    "@type": "Offer",
    priceCurrency: "USD",
    price: "0",
    availability: "https://schema.org/InStock",
    eligibleRegion: {
      "@type": "Place",
      name: "Worldwide",
    },
  },
  audience: {
    "@type": "Audience",
    audienceType:
      "Students, Educators, Office Workers, Business Professionals, Corporations, Freelancers, Legal Professionals, Attorneys, Corporate Legal Departments",
  },
});
