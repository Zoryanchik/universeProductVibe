import { stripSlashes } from "@/shared/lib/utils/stripSlashes";

import { TEMPLATES_BASE_PATH, TEMPLATES_EDITOR_PATH } from "../model/constants";

/** `/pdf-templates` */
export const getCatalogUrl = (): string => TEMPLATES_BASE_PATH;

/** `/pdf-templates/<category>` */
export const getCategoryUrl = (categorySlug: string): string =>
  `${TEMPLATES_BASE_PATH}/${stripSlashes(categorySlug)}`;

/** `/pdf-templates/<category>/<subcategory>` */
export const getSubcategoryUrl = (
  categorySlug: string,
  subcategorySlug: string
): string =>
  `${TEMPLATES_BASE_PATH}/${stripSlashes(categorySlug)}/${stripSlashes(
    subcategorySlug
  )}`;

/** `/pdf-templates/<category>/<template>` (template URLs are always 2-deep). */
export const getTemplateUrl = (
  categorySlug: string,
  templateSlug: string
): string =>
  `${TEMPLATES_BASE_PATH}/${stripSlashes(categorySlug)}/${stripSlashes(
    templateSlug
  )}`;

/** `/pdf-templates/editor?form=<template>` */
export const getEditorUrl = (templateSlug: string): string =>
  `${TEMPLATES_EDITOR_PATH}?form=${encodeURIComponent(
    stripSlashes(templateSlug)
  )}`;

/**
 * Append `/page/N` to a base path for pages > 1. Page 1 returns the base path
 * unchanged so the canonical of page 1 is the bare listing URL.
 */
export const withPage = (basePath: string, page: number): string =>
  page > 1 ? `${basePath}/page/${page}` : basePath;
