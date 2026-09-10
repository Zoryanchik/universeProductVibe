import { WEB_HOST } from "astro:env/client";

import type {
  OrganizationSchema,
  SchemaConfig,
} from "../../../types/seo/schema";

export const generateOrganizationSchema = ({
  path,
  description,
}: SchemaConfig): OrganizationSchema => ({
  "@type": "Organization",
  name: "OnlyDoc",
  url: `https://${WEB_HOST}${path}`,
  logo: `https://${WEB_HOST}/assets/header/logo-only-doc-dark.svg`,
  description,
  foundingDate: "2025-01-21",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "onlydocaddress@gmail.com",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "Archiepiskopou Makariou III, 95, Charitini Court, 1st floor, office 102",
    addressLocality: "Nicosia",
    addressRegion: "Nicosia",
    postalCode: "1071",
    addressCountry: "CY",
  },
});
