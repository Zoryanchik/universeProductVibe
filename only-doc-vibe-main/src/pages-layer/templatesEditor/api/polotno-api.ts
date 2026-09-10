import { PUBLIC_POLOTNO_API_KEY } from "astro:env/client";

import type {
  IGetUnsplashImagesParams,
  INounProjectResponse,
  ITextTemplates,
  IUnsplashImages,
  TemplatesData,
} from "../model/types";

const POLOTNO_BASE_URL = "https://api.polotno.com/api";
const POLOTNO_API_KEY = PUBLIC_POLOTNO_API_KEY ?? "";

const fetchPolotno = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`Polotno API error: ${res.status}`);

  return (await res.json()) as T;
};

export const fetchTextTemplates = (): Promise<ITextTemplates> =>
  fetchPolotno<ITextTemplates>(
    `${POLOTNO_BASE_URL}/get-text-templates?KEY=${POLOTNO_API_KEY}`
  );

export const fetchGoogleFonts = (): Promise<string[]> =>
  fetchPolotno<string[]>(
    `${POLOTNO_BASE_URL}/get-google-fonts?KEY=${POLOTNO_API_KEY}`
  );

export const fetchUnsplashImages = (
  params?: IGetUnsplashImagesParams
): Promise<IUnsplashImages> => {
  const { query = "", per_page = 20, page = 1 } = params || {};

  return fetchPolotno<IUnsplashImages>(
    `${POLOTNO_BASE_URL}/get-unsplash?query=${encodeURIComponent(
      query
    )}&per_page=${per_page}&page=${page}&KEY=${POLOTNO_API_KEY}`
  );
};

export const fetchNounProjectIcons = (
  params?: IGetUnsplashImagesParams
): Promise<INounProjectResponse> => {
  const { query = "", page = 1 } = params || {};

  return fetchPolotno<INounProjectResponse>(
    `${POLOTNO_BASE_URL}/get-nounproject?query=${encodeURIComponent(
      query.replace(/ /g, "")
    )}&page=${page}&KEY=${POLOTNO_API_KEY}`
  );
};

const EMPTY_TEMPLATES_DATA: TemplatesData = { categories: [], templates: [] };

export const fetchTemplatesData = async (): Promise<TemplatesData> => {
  if (typeof document === "undefined") return EMPTY_TEMPLATES_DATA;

  const node = document.getElementById("editor-templates");
  if (!node?.textContent) return EMPTY_TEMPLATES_DATA;

  try {
    return JSON.parse(node.textContent) as TemplatesData;
  } catch {
    return EMPTY_TEMPLATES_DATA;
  }
};

export { POLOTNO_API_KEY };
