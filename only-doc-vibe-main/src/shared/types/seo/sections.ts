import type { components } from "../../api/cms/cms-schema";
import type { ELanguages } from "../../constants/languages";

type ServicePage = components["schemas"]["ServicePage"];

/** Union of all section components returned by the MainPage and ServicePage APIs */
export type SectionComponent =
  | components["schemas"]["MainPage"]["sections"][number]
  | ServicePage["sections"][number];

export type BaseSectionProps = {
  context: "home" | "service";
  lang: ELanguages;
  service?: ServicePage;
  flow?: unknown;
  isSchemaHidden?: boolean;
  slug?: string;
};

/** Single benefit item for Benefits section */
export interface IBenefitItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly iconUrl?: string;
}

/** Benefits section content */
export interface IBenefitsContent {
  readonly title: string;
  readonly gridLabel: string;
  readonly items: readonly IBenefitItem[];
}

export type SectionRouterProps = BaseSectionProps & {
  sections: SectionComponent[];
};
