export { collectTemplateSitemapPaths } from "./api/collect-sitemap-paths";
export {
  getCatalogPagedStaticPaths,
  getCategoryChildStaticPaths,
  getCategoryPagedStaticPaths,
  getCategoryStaticPaths,
  getSubcategoryPagedStaticPaths,
} from "./api/static-paths/templates-static-paths";
export {
  TEMPLATES_BASE_PATH,
  TEMPLATES_EDITOR_PATH,
  TEMPLATES_PER_PAGE,
} from "./model/constants";
export { default as CatalogPage } from "./ui/CatalogPage.astro";
export { default as CategoryChildPage } from "./ui/CategoryChildPage.astro";
export { default as CategoryListPage } from "./ui/CategoryListPage.astro";
export { default as TemplatePage } from "./ui/TemplatePage.astro";
