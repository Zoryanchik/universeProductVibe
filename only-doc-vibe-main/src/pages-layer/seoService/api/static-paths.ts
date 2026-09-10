import { availableLocales } from "@/shared/config/locale";

import { getLocalizedMainPages } from "./get-home-static-routes";
import {
  getLocalizedServicePages,
  getServicePages,
} from "./get-service-static-routes";

export async function getHomePageLocalesStaticPaths() {
  return getLocalizedMainPages(availableLocales);
}

export async function getServicePageStaticPaths() {
  return getServicePages();
}

export async function getServicePageLocalesStaticPaths() {
  return getLocalizedServicePages();
}
