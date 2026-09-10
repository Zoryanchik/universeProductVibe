export { getAllServiceRoutes } from "./api/fetch-all-service-routes";
export { fetchHomePageData } from "./api/fetch-home-page-data";
export {
  getHomePageLocalesStaticPaths,
  getServicePageLocalesStaticPaths,
  getServicePageStaticPaths,
} from "./api/static-paths";
export type { IServiceFunctionalConfig } from "./model/service-config";
export { getServiceConfig, resolveServiceConfig } from "./model/service-config";
export type { PageAttributes } from "./model/types";
export { default as SEOHomePageIndex } from "./ui/home/SEOHomePageIndex.astro";
export { default as SectionRouter } from "./ui/sections/router/SectionRouter.astro";
export { default as SEOServicePageIndex } from "./ui/service/SEOServicePageIndex.astro";
export { default as ServicePage } from "./ui/service/ServicePage.astro";
export { default as ServicePageLocales } from "./ui/service/ServicePageLocales.astro";
