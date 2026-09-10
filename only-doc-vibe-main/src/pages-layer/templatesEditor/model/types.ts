import type { ReactNode } from "react";

export interface TemplatesData {
  categories: {
    name: string;
    title: string;
    subCategories: { name: string; title: string }[];
  }[];
  templates: {
    templateId: string;
    title: string;
    category: string;
    subCategories: string[];
    coverImageUrl?: string;
    polotnoUrl: string;
  }[];
}

export interface ITextTemplateItem {
  json: string;
  preview: string;
}

export interface ITextTemplates {
  hits: number;
  items: ITextTemplateItem[];
}

export interface IUnsplashImageUrls {
  raw: string;
  full: string;
  regular: string;
  small: string;
  thumb: string;
}

export interface IUnsplashImageLinks {
  self: string;
  html: string;
  download: string;
  download_location: string;
}

export interface IUnsplashUser {
  id: string;
  name: string;
  username: string;
}

export interface IUnsplashImageResult {
  id: string;
  created_at: string;
  updated_at: string;
  width: number;
  height: number;
  color: string;
  blur_hash: string;
  description: string | null;
  alt_description: string | null;
  urls: IUnsplashImageUrls;
  links: IUnsplashImageLinks;
  likes: number;
  user: IUnsplashUser;
}

export interface IUnsplashImages {
  total: number;
  total_pages: number;
  results: IUnsplashImageResult[];
}

export interface IUploadedFont {
  fontFamily: string;
  url: string;
}

export interface IUnsplashListMeta {
  query: string;
  page: number;
  totalPages: number;
  total: number;
}

export interface INounProjectIcon {
  id: string;
  preview_url_84: string;
  preview_url_42?: string;
  term?: string;
}

export interface INounProjectResponse {
  icons: INounProjectIcon[];
  pagesNumber: number;
}

export interface ITemplatesEditorToast {
  id?: string;
  header: string;
  content: ReactNode;
  variant?: "danger" | "warning" | "success";
  button?: {
    label: string;
    onClick: () => void;
    closeOnClick?: boolean;
  };
  autoCloseOnCondition?: () => boolean;
  autoCloseMs?: number;
  onClose?: () => void;
  closeLabel?: string;
  _id?: number;
}

export interface IGetUnsplashImagesParams {
  query?: string;
  per_page?: number;
  page?: number;
  append?: boolean;
}
