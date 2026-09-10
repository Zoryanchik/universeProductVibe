import type { components } from "@/shared/api/cms/cms-schema";
import type { ELanguages } from "@/shared/constants/languages";

/**
 * Link item from CMS
 */
export type GlobalLinkComponent = components["schemas"]["GlobalLinkComponent"];

/**
 * Link column structure from CMS
 */
export interface ILinkColumn {
  readonly id: number | string;
  readonly title: string | null;
  readonly link_item: readonly GlobalLinkComponent[];
}

/**
 * Logo structure from CMS
 */
export interface IFooterLogo {
  readonly id: number | string;
  readonly documentId: string | number;
  readonly name: string;
  readonly alternativeText: string | null;
  readonly url: string;
  readonly width: number;
  readonly height: number;
}

/**
 * Footer data from CMS
 */
export interface IFooterData {
  readonly id: number | string;
  readonly documentId: string | number;
  readonly title: string;
  readonly legal_address: string;
  readonly logo: readonly IFooterLogo[];
  readonly tools_links: ILinkColumn;
  readonly company_links: ILinkColumn;
  readonly legal_links: ILinkColumn;
  readonly locale: string;
  readonly localizations?: ReadonlyArray<{
    readonly locale?: string;
  }>;
}

/**
 * Footer component props
 */
export interface IFooterProps {
  readonly data?: IFooterData;
  readonly path: string;
  readonly currentLang: ELanguages;
}
