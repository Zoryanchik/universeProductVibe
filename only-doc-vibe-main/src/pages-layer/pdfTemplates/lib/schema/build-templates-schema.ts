import { WEB_HOST } from "astro:env/client";

import type { SchemaGraph } from "@/shared/types/seo/schema";

import { getCatalogUrl } from "../urls";

type GraphNode = Record<string, unknown>;

const origin = (): string => `https://${WEB_HOST}`;
const abs = (path: string): string => `${origin()}${path}`;

const websiteNode = (): GraphNode => ({
  "@type": "WebSite",
  "@id": `${origin()}/#website`,
  url: `${origin()}/`,
  name: "OnlyDoc",
  publisher: { "@id": `${origin()}/#organization` },
});

const organizationNode = (): GraphNode => ({
  "@type": "Organization",
  "@id": `${origin()}/#organization`,
  name: "OnlyDoc",
  url: `${origin()}/`,
});

const catalogCollectionNode = (): GraphNode => ({
  "@type": "CollectionPage",
  "@id": `${abs(getCatalogUrl())}#webpage`,
  url: abs(getCatalogUrl()),
  name: "PDF Templates",
  isPartOf: { "@id": `${origin()}/#website` },
});

const faqNode = (
  items: ReadonlyArray<{ question: string; answer: string }>
): GraphNode | null => {
  if (!items.length) return null;

  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
};

const breadcrumbList = (
  id: string,
  items: ReadonlyArray<{ name: string; item: string }>
): GraphNode => ({
  "@type": "BreadcrumbList",
  "@id": id,
  itemListElement: items.map((entry, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: entry.name,
    item: entry.item,
  })),
});

const homeCrumb = () => ({ name: "Home", item: `${origin()}/` });
const catalogCrumb = () => ({
  name: "PDF Templates",
  item: abs(getCatalogUrl()),
});

const asGraph = (graph: ReadonlyArray<GraphNode>): SchemaGraph =>
  ({
    "@context": "https://schema.org",
    "@graph": graph,
  }) as unknown as SchemaGraph;

/* ------------------------------- Catalog -------------------------------- */

export const buildCatalogSchema = ({
  name,
  description,
}: {
  name: string;
  description: string;
}): SchemaGraph => {
  const webpageId = `${abs(getCatalogUrl())}#webpage`;
  const breadcrumbId = `${abs(getCatalogUrl())}#breadcrumb`;

  return asGraph([
    {
      "@type": "CollectionPage",
      "@id": webpageId,
      url: abs(getCatalogUrl()),
      name,
      description,
      inLanguage: "en",
      isPartOf: { "@id": `${origin()}/#website` },
      breadcrumb: { "@id": breadcrumbId },
    },
    breadcrumbList(breadcrumbId, [homeCrumb(), catalogCrumb()]),
    websiteNode(),
    organizationNode(),
  ]);
};

/* ---------------------------- Category page ----------------------------- */

export const buildCategorySchema = ({
  name,
  description,
  url,
  faqItems,
}: {
  name: string;
  description: string;
  url: string;
  faqItems: ReadonlyArray<{ question: string; answer: string }>;
}): SchemaGraph => {
  const webpageId = `${url}#webpage`;
  const breadcrumbId = `${url}#breadcrumb`;
  const faq = faqNode(faqItems);

  return asGraph([
    {
      "@type": "CollectionPage",
      "@id": webpageId,
      url,
      name,
      description,
      inLanguage: "en",
      isPartOf: { "@id": `${abs(getCatalogUrl())}#webpage` },
      breadcrumb: { "@id": breadcrumbId },
    },
    breadcrumbList(breadcrumbId, [
      homeCrumb(),
      catalogCrumb(),
      { name, item: url },
    ]),
    catalogCollectionNode(),
    websiteNode(),
    organizationNode(),
    ...(faq ? [faq] : []),
  ]);
};

/* -------------------------- Subcategory page ---------------------------- */

export const buildSubcategorySchema = ({
  name,
  description,
  url,
  categoryName,
  categoryUrl,
  faqItems,
}: {
  name: string;
  description: string;
  url: string;
  categoryName: string;
  categoryUrl: string;
  faqItems: ReadonlyArray<{ question: string; answer: string }>;
}): SchemaGraph => {
  const webpageId = `${url}#webpage`;
  const breadcrumbId = `${url}#breadcrumb`;
  const faq = faqNode(faqItems);

  return asGraph([
    {
      "@type": "CollectionPage",
      "@id": webpageId,
      url,
      name,
      description,
      inLanguage: "en",
      isPartOf: { "@id": `${categoryUrl}#webpage` },
      breadcrumb: { "@id": breadcrumbId },
    },
    breadcrumbList(breadcrumbId, [
      homeCrumb(),
      catalogCrumb(),
      { name: categoryName, item: categoryUrl },
      { name, item: url },
    ]),
    {
      "@type": "CollectionPage",
      "@id": `${categoryUrl}#webpage`,
      url: categoryUrl,
      name: categoryName,
      isPartOf: { "@id": `${abs(getCatalogUrl())}#webpage` },
    },
    catalogCollectionNode(),
    websiteNode(),
    organizationNode(),
    ...(faq ? [faq] : []),
  ]);
};

/* ---------------------------- Template page ----------------------------- */

export const buildTemplateSchema = ({
  name,
  description,
  url,
  categoryName,
  categoryUrl,
  subcategory,
  faqItems,
}: {
  name: string;
  description: string;
  url: string;
  categoryName: string;
  categoryUrl: string;
  subcategory?: { name: string; url: string };
  faqItems: ReadonlyArray<{ question: string; answer: string }>;
}): SchemaGraph => {
  const webpageId = `${url}#webpage`;
  const breadcrumbId = `${url}#breadcrumb`;
  const faq = faqNode(faqItems);
  // Strip a trailing "template" word for the `about.name` per spec.
  const aboutName = name.replace(/\s*templates?$/i, "").trim() || name;

  const breadcrumbItems = [
    homeCrumb(),
    catalogCrumb(),
    { name: categoryName, item: categoryUrl },
    ...(subcategory ? [{ name: subcategory.name, item: subcategory.url }] : []),
    { name, item: url },
  ];

  return asGraph([
    {
      "@type": "WebPage",
      "@id": webpageId,
      url,
      name,
      description,
      inLanguage: "en",
      isPartOf: { "@id": `${categoryUrl}#webpage` },
      breadcrumb: { "@id": breadcrumbId },
      mainEntity: { "@id": url },
    },
    {
      "@type": "DigitalDocument",
      "@id": url,
      url,
      mainEntityOfPage: { "@id": webpageId },
      name,
      description,
      encodingFormat: "application/pdf",
      genre: "PDF template",
      inLanguage: "en",
      about: { "@type": "Thing", name: aboutName },
      isPartOf: { "@id": `${categoryUrl}#webpage` },
      publisher: { "@id": `${origin()}/#organization` },
      creator: { "@id": `${origin()}/#organization` },
    },
    breadcrumbList(breadcrumbId, breadcrumbItems),
    {
      "@type": "CollectionPage",
      "@id": `${categoryUrl}#webpage`,
      url: categoryUrl,
      name: categoryName,
      isPartOf: { "@id": `${abs(getCatalogUrl())}#webpage` },
    },
    catalogCollectionNode(),
    websiteNode(),
    organizationNode(),
    ...(faq ? [faq] : []),
  ]);
};
