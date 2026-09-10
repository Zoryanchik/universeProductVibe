import type { EFlow } from "@/entities/documents";

export interface IReview {
  slug: string;
  locale: string;
  title: string;
  text: string;
  author: string;
  createdAt: string;
  stars: number;
  id: string;
}

export type PageAttributes = {
  sections?: Array<Record<string, unknown>>;
  meta?: { slug?: string };
  flow?: EFlow;
  [key: string]: unknown;
};

export type AllowedExtension =
  | ".azw3"
  | ".bmp"
  | ".csv"
  | ".djvu"
  | ".doc"
  | ".docx"
  | ".dwg"
  | ".dxf"
  | ".epub"
  | ".eps"
  | ".gif"
  | ".heic"
  | ".html"
  | ".jpeg"
  | ".jpg"
  | ".mobi"
  | ".pdf"
  | ".png"
  | ".ppt"
  | ".pptx"
  | ".svg"
  | ".text"
  | ".tiff"
  | ".webp"
  | ".xlsx"
  | ".xls"
  | ".zip"
  | ".cbr"
  | "multiple"
  | "all";
