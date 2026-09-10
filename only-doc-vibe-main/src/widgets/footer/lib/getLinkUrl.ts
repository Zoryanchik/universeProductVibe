import type { ELanguages } from "@/shared/constants/languages";
import { navigateThroughURL } from "@/shared/lib/seo/navigate-through-url";

import type { GlobalLinkComponent } from "../model/types";

export const getLinkUrl = (
  link: GlobalLinkComponent,
  locale: ELanguages
): string => {
  if (link.url) {
    return navigateThroughURL(link.url, locale);
  }

  if (link.custom_link_id) {
    return navigateThroughURL(`/${link.custom_link_id}`, locale);
  }

  if (link.link_id) {
    return navigateThroughURL(`/${link.link_id.replace(/_/g, "-")}`, locale);
  }

  return "#";
};
