import type { components } from "@/shared/api/cms/cms-schema";
import { EPageType } from "@/shared/constants/page-type";
import type { ELanguages } from "@/shared/constants/languages";
import { prepareSeoData } from "@/shared/lib/seo/prepare-seo-data";
import type { TFunction } from "@/shared/lib/translations/types";

import type { IContactUsPageContent, IFallbackIcons } from "../model/types";

type ContactUsData = components["schemas"]["ContactUs"];

interface IResolveParams {
  readonly pageData: ContactUsData | undefined;
  readonly translate: TFunction;
  readonly fallbackIcons: IFallbackIcons;
  readonly pathname: string;
  readonly url: string;
  readonly lang: ELanguages;
  readonly localeSlugMap?: Record<string, string>;
}

export const resolveContactUsContent = ({
  pageData,
  translate,
  fallbackIcons,
  pathname,
  url,
  lang,
  localeSlugMap,
}: IResolveParams): IContactUsPageContent => {
  const translateToString = (key: string): string => translate(key) as string;

  const seoProps = pageData?.seo
    ? prepareSeoData(
        {
          ...pageData.seo,
          publishedAt: pageData.publishedAt,
          updatedAt: pageData.updatedAt,
        },
        pathname,
        EPageType.CONTACT_US,
        lang,
        undefined,
        localeSlugMap
      )
    : {
        title: translateToString("contact_us.title"),
        canonicalUrl: url,
      };

  const emailItem = pageData?.contact_info_items?.[0];
  const addressItem = pageData?.contact_info_items?.[1];
  const phoneItem = pageData?.contact_info_items?.[2];

  return {
    title: pageData?.title || translateToString("contact_us.title"),
    subtitle: pageData?.subtitle || translateToString("contact_us.subtitle"),
    seoProps,
    email: {
      label: emailItem?.title || translateToString("global.email"),
      value: emailItem?.value || translateToString("legal.email"),
      iconSrc: emailItem?.icon?.url || fallbackIcons.email,
    },
    address: {
      label: addressItem?.title || translateToString("contact_us.address"),
      value: addressItem?.value || translateToString("legal.address"),
      iconSrc: addressItem?.icon?.url || fallbackIcons.address,
    },
    phone: {
      label: phoneItem?.title || translateToString("contact_us.phone"),
      value: phoneItem?.value || translateToString("legal.phone"),
      iconSrc: phoneItem?.icon?.url || fallbackIcons.phone,
    },
    formContent: {
      formTitle:
        pageData?.form_title || translateToString("contact_us.form_title"),
      namePlaceholder:
        pageData?.form_name_placeholder ||
        translateToString("contact_us.form_placeholders.name"),
      emailPlaceholder:
        pageData?.form_email_placeholder ||
        translateToString("contact_us.form_placeholders.email"),
      messagePlaceholder:
        pageData?.form_message_placeholder ||
        translateToString("contact_us.form_placeholders.message"),
      submitButtonText:
        pageData?.form_submit_button_text ||
        translateToString("contact_us.form_placeholders.submit_button"),
      requiredFieldText:
        pageData?.required_field ||
        translateToString("contact_us.required_field"),
    },
  };
};
