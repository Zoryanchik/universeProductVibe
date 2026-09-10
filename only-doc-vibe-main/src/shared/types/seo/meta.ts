import type { ELanguages } from "../../constants/languages";
import type { SchemaGraph } from "./schema";

export interface HreflangItem {
  lang: ELanguages | "x-default";
  url: string;
}

export interface SeoProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  hreflangs?: HreflangItem[];
  canonicalUrl?: string;
  schema?: SchemaGraph;
  isHidden?: boolean;
}

export type SchemaPageType = "main" | "service" | "other";
