import type { components } from "@/shared/api/cms/cms-schema";

export type CmsTemplatesHome = components["schemas"]["TemplatesHome"];
export type CmsTemplateCategory = components["schemas"]["TemplateCategory"];
export type CmsTemplateSubcategory =
  components["schemas"]["TemplateSubcategory"];
export type CmsTemplatePage = components["schemas"]["TemplatePage"];
export type CmsSeoComponent = components["schemas"]["SeoSeoComponent"];
export type CmsPaginatedSeoComponent =
  components["schemas"]["SeoPaginatedSeoComponent"];
export type CmsFaqComponent = components["schemas"]["SectionsFaqComponent"];

export interface ITemplateCard {
  readonly slug: string;
  readonly title: string;
  readonly categoryLabel: string;
  readonly categorySlug: string;
  readonly coverImageUrl?: string;
  readonly coverImageAlt: string;
}

export interface ITemplateSubcategoryNav {
  readonly slug: string;
  readonly title: string;
  readonly count: number;
  readonly categorySlug: string;
}

export interface ITemplateCategoryNav {
  readonly slug: string;
  readonly title: string;
  readonly count: number;
  readonly subcategories: ReadonlyArray<ITemplateSubcategoryNav>;
}

export interface ITemplateListResult {
  readonly templates: ReadonlyArray<ITemplateCard>;
  readonly page: number;
  readonly pageCount: number;
  readonly total: number;
}

export interface ITemplateSearchEntry {
  readonly slug: string;
  readonly title: string;
  readonly categoryLabel: string;
  readonly categorySlug: string;
}
