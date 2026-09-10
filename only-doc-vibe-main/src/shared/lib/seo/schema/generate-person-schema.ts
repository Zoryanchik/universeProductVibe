import type { PersonSchema } from "../../../types/seo/schema";

interface PersonSchemaInput {
  readonly url: string;
  readonly name: string;
  readonly imageUrl?: string;
  readonly jobTitle?: string;
  readonly sameAs?: ReadonlyArray<string>;
}

export const generatePersonSchema = ({
  url,
  name,
  imageUrl,
  jobTitle,
  sameAs,
}: PersonSchemaInput): PersonSchema => ({
  "@type": "Person",
  name,
  url,
  image: imageUrl,
  jobTitle,
  sameAs: sameAs && sameAs.length > 0 ? [...sameAs] : undefined,
});
