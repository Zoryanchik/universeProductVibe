import type { components } from "@/shared/api/cms/cms-schema";
import type { EServiceTabId, IToolCard } from "@/shared/constants/service-tabs";
import type { ELanguages } from "@/shared/constants/languages";
import { getLocalizedPath } from "@/shared/lib/navigation/getLocalizedPath";

import type { IServiceTab } from "../ui/HeroServiceTabs";
import type { IFeatureHighlight } from "../ui/HeroToolCards/types";

type ServiceType = components["schemas"]["ServiceServiceTypeComponent"] & {
  subtitle?: string | null;
  cta_button?: string | null;
};

type ServiceCategoryItem =
  components["schemas"]["ServiceServiceCategoryComponent"] & {
    category_icon?: { url: string } | null;
  };

type SectionsServicesComponent = Omit<
  components["schemas"]["SectionsServicesComponent"],
  "category_item"
> & {
  category_item: ServiceCategoryItem[];
  feature_highlights?: {
    id: string | number;
    image_id: string;
    image?: { url: string };
  }[];
  show_more_button?: string | null;
};

type GlobalBlock = components["schemas"]["GlobalBlock"];

interface MappedServicesResult {
  readonly tabs: readonly IServiceTab[];
  readonly cards: readonly IToolCard[];
  readonly featureHighlights: readonly IFeatureHighlight[];
  readonly showMoreButtonText?: string;
}

const normalizeSlug = (slug: string): string =>
  slug.startsWith("/") ? slug.slice(1) : slug;

const mapServiceToCard = (
  service: ServiceType,
  categoryId: string,
  lang?: ELanguages
): IToolCard => {
  const path = `/${normalizeSlug(service.slug)}`;

  return {
    id: normalizeSlug(service.slug) || String(service.id),
    title: service.title,
    description: service.subtitle ?? undefined,
    ctaButton: service.cta_button ?? undefined,
    icon: service.image?.url ?? "",
    category: categoryId as EServiceTabId,
    url: lang ? getLocalizedPath(path, lang) : path,
  };
};

const findServicesWidget = (
  widgets: GlobalBlock["widgets"]
): SectionsServicesComponent | undefined =>
  widgets.find(
    (w): w is SectionsServicesComponent =>
      "__component" in w && w.__component === "sections.services"
  );

/**
 * Maps a fully-populated GlobalBlock (services list) to tabs and tool cards.
 *
 * Data path: GlobalBlock.widgets → SectionsServicesComponent.category_item → service_item
 * Returns empty arrays when CMS data is not available, allowing fallback to constants.
 */
export const mapCmsServicesToTabsAndCards = (
  servicesBlock?: GlobalBlock,
  lang?: ELanguages
): MappedServicesResult => {
  const servicesWidget = servicesBlock?.widgets
    ? findServicesWidget(servicesBlock.widgets)
    : undefined;

  const categories = servicesWidget?.category_item;

  if (!categories?.length) {
    return {
      tabs: [],
      cards: [],
      featureHighlights: [],
      showMoreButtonText: undefined,
    };
  }

  const tabs: IServiceTab[] = categories.map((cat) => ({
    id: cat.category_id,
    label: cat.title,
    iconUrl: cat.category_icon?.url ?? undefined,
  }));

  const cards: IToolCard[] = categories.flatMap((cat) =>
    (cat.service_item ?? []).map((service) =>
      mapServiceToCard(service, cat.category_id, lang)
    )
  );

  const featureHighlights: IFeatureHighlight[] = (
    servicesWidget?.feature_highlights ?? []
  ).map((fh) => ({
    id: String(fh.id),
    label: fh.image_id,
    iconUrl: fh.image?.url ?? "",
  }));

  const showMoreButtonText = servicesWidget?.show_more_button ?? undefined;

  return { tabs, cards, featureHighlights, showMoreButtonText };
};
