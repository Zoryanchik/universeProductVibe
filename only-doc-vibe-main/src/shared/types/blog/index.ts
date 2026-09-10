import type { components } from "../../api/cms/cms-schema";
import type { ELanguages } from "../../constants/languages";

type SeoComponent = components["schemas"]["SeoSeoComponent"];

export type IBlogCtaBlock = components["schemas"]["BlogCtaBlockComponent"];

export interface IBlogKeyTakeaway {
  readonly id?: number;
  readonly header?: string | null;
  readonly text: string;
}

export interface IBlogPaginatedSeo extends SeoComponent {
  readonly page: string;
}

export interface IBlogMediaFormat {
  readonly url: string;
  readonly width?: number;
  readonly height?: number;
}

export interface IBlogMedia {
  readonly id?: number;
  readonly url: string;
  readonly alternativeText?: string | null;
  readonly width?: number;
  readonly height?: number;
  readonly formats?: {
    readonly thumbnail?: IBlogMediaFormat;
    readonly small?: IBlogMediaFormat;
    readonly medium?: IBlogMediaFormat;
    readonly large?: IBlogMediaFormat;
  } | null;
}

export interface IBlogCategory {
  readonly id: number;
  readonly documentId?: string;
  readonly slug: string;
  readonly name: string;
  readonly description?: string | null;
  readonly inline_cta?: IBlogCtaBlock | null;
  readonly locale?: ELanguages;
  readonly seo?: SeoComponent;
  readonly paginated_seo?: ReadonlyArray<IBlogPaginatedSeo>;
}

export interface IBlogAuthor {
  readonly id: number;
  readonly documentId?: string;
  readonly slug: string;
  readonly name: string;
  readonly role?: string | null;
  readonly avatar?: IBlogMedia | null;
  readonly twitter_url?: string | null;
  readonly linkedin_url?: string | null;
  readonly email?: string | null;
  readonly bio_section?: string | null;
  readonly inline_cta?: IBlogCtaBlock | null;
  readonly seo?: SeoComponent;
  readonly locale?: ELanguages;
  readonly localizations?: ReadonlyArray<{
    readonly locale: ELanguages;
    readonly slug: string;
  }>;
}

export interface IBlogArticle {
  readonly id: number;
  readonly documentId?: string;
  readonly slug: string;
  readonly title: string;
  readonly subtitle?: string | null;
  readonly bg_image?: IBlogMedia | null;
  readonly publication_date: string;
  readonly updatedAt?: string;
  readonly publishedAt?: string;
  readonly reading_time?: number | null;
  readonly views_number?: number | null;
  readonly main_content: string;
  readonly key_takeaways?: ReadonlyArray<IBlogKeyTakeaway>;
  readonly cta_block_inline?: IBlogCtaBlock | null;
  readonly cta_block_right?: IBlogCtaBlock | null;
  readonly cta_after_section?: number | null;
  readonly category?: IBlogCategory | null;
  readonly author?: IBlogAuthor | null;
  readonly related_articles?: ReadonlyArray<IBlogArticle>;
  readonly seo?: SeoComponent;
  readonly locale?: ELanguages;
  readonly localizations?: ReadonlyArray<{
    readonly locale: ELanguages;
    readonly slug: string;
  }>;
}

export interface IBlogListContext {
  readonly page: number;
  readonly pageCount: number;
  readonly totalArticles: number;
  readonly category?: IBlogCategory | null;
  readonly articles: ReadonlyArray<IBlogArticle>;
}

export interface IBlogListRouteParams {
  readonly locale: ELanguages;
  readonly category?: string;
  readonly page: number;
  readonly isDefaultLocale: boolean;
}

export interface IStrapiPaginationMeta {
  readonly pagination: {
    readonly page: number;
    readonly pageSize: number;
    readonly pageCount: number;
    readonly total: number;
  };
}

export interface IStrapiCollectionResponse<T> {
  readonly data: ReadonlyArray<T>;
  readonly meta: IStrapiPaginationMeta;
}

export interface IStrapiSingleResponse<T> {
  readonly data: T;
  readonly meta?: unknown;
}
