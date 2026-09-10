import { CMS_HOST, CMS_READ_TOKEN } from "astro:env/server";
import axios, { type AxiosResponse } from "axios";

import { logger } from "../../lib/utils/logger";

declare module "axios" {
  export interface AxiosInstance {
    getPage<T>(url: string, attempt?: number): Promise<T>;
  }
}

const timeoutPromise = async <T>(timeMs: number): Promise<T> =>
  new Promise((_, reject) => setTimeout(() => reject(true), timeMs));

const REQUEST_ATTEMPS = 3;
const REQUEST_TIMEOUT = 15000;

const isNonRetryableError = (err: unknown): boolean => {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;

    return status === 400 || status === 401 || status === 403 || status === 404;
  }

  return false;
};

const cmsHttpClient = axios.create({
  baseURL: `https://${CMS_HOST}/api`,
  headers: {
    Authorization: `Bearer ${CMS_READ_TOKEN}`,
  },
});

const localCacheTest: Record<string, unknown> = {};

cmsHttpClient.getPage = async <T>(url: string, attempt = 1): Promise<T> => {
  if (localCacheTest[url]) return localCacheTest[url] as T;

  if (attempt > 1) logger.log(`Strapi request. Attempt: ${attempt}`);

  logger.log(`Strapi request. ${url}`);
  try {
    const response = await Promise.race([
      timeoutPromise<AxiosResponse<T>>(REQUEST_TIMEOUT),
      cmsHttpClient.get<T>(url),
    ]);
    const data = response.data;
    localCacheTest[url] = data;

    return data;
  } catch (err) {
    if (attempt < REQUEST_ATTEMPS && !isNonRetryableError(err)) {
      return await cmsHttpClient.getPage(url, attempt + 1);
    }

    throw new Error(`Strapi request error: ${err}. Url: ${url}`);
  }
};

/**
 * Fetches a specific page of data from Strapi
 */
const getStrapiPages = async <T>(page: number, url: string): Promise<T> => {
  const paginatedUrl = url.includes("?")
    ? `${url}&pagination[page]=${page}`
    : `${url}?pagination[page]=${page}`;

  return cmsHttpClient.getPage<T>(paginatedUrl);
};

/**
 * Fetches all routes from Strapi by iterating through pages
 */
const getAllRoutes = async <T>(url: string): Promise<Array<T>> => {
  let currentPage = 1;
  const pages: Array<T> = [];
  let pageCount = 0;

  do {
    const result = await getStrapiPages<{
      data: T[];
      meta: { pagination: { pageCount: number } };
    }>(currentPage, url);

    pages.push(...result.data);

    if (result?.meta?.pagination?.pageCount) {
      pageCount = result.meta.pagination.pageCount;
    }

    currentPage++;
  } while (currentPage <= pageCount);

  return pages;
};

export { cmsHttpClient, getAllRoutes };
