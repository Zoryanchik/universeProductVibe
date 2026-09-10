import type { SeoProps } from "@/shared/types/seo/meta";

import type { IContactUsFormContent } from "@/features/contact-us";

export interface IContactInfoItem {
  readonly label: string;
  readonly value: string;
  readonly iconSrc: string;
}

export interface IContactUsPageContent {
  readonly title: string;
  readonly subtitle: string;
  readonly seoProps: SeoProps;
  readonly email: IContactInfoItem;
  readonly address: IContactInfoItem;
  readonly phone: IContactInfoItem;
  readonly formContent: IContactUsFormContent;
}

export interface IFallbackIcons {
  readonly email: string;
  readonly address: string;
  readonly phone: string;
}
