import type { EPageType } from "../../constants/page-type";

export interface SchemaConfig {
  path: string;
  description: string;
  h1?: string;
  howToImageUrl?: string;
  webHost?: string;
}

export interface OrganizationSchema {
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
  description: string;
  foundingDate: string;
  contactPoint?: {
    "@type": "ContactPoint";
    contactType?: string;
    email?: string;
  };
  address: {
    "@type": "PostalAddress";
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
}

export interface WebapplicationSchema {
  "@type": "WebApplication";
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  datePublished: string;
  dateModified?: string;
  author: {
    "@type": "Organization";
    name: string;
    url: string;
  };
  aggregateRating: {
    "@type": "AggregateRating";
    reviewCount: string;
    ratingValue: string;
  };
  offers: {
    "@type": "Offer";
    priceCurrency: string;
    price: string;
    availability: string;
    eligibleRegion: {
      "@type": "Place";
      name: string;
    };
  };
  audience: {
    "@type": "Audience";
    audienceType: string;
  };
}

export interface FaqQuestion {
  question?: string;
  answer?: string;
}

export interface FaqSection {
  __component: string;
  questions?: FaqQuestion[];
  [key: string]: unknown;
}

export interface FaqSchema {
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name?: string;
    acceptedAnswer: {
      "@type": "Answer";
      text?: string;
    };
  }>;
}

export interface ArticleSchema {
  "@type": "Article" | "BlogPosting";
  headline: string;
  description?: string;
  image?: string | string[];
  datePublished: string;
  dateModified?: string;
  author?: {
    "@type": "Person" | "Organization";
    name: string;
    url?: string;
  };
  publisher?: {
    "@type": "Organization";
    name: string;
    logo?: { "@type": "ImageObject"; url: string };
  };
  mainEntityOfPage: {
    "@type": "WebPage";
    "@id": string;
  };
}

export interface PersonSchema {
  "@type": "Person";
  name: string;
  url: string;
  image?: string;
  jobTitle?: string;
  sameAs?: string[];
}

export type SchemaItem =
  | FaqSchema
  | OrganizationSchema
  | WebapplicationSchema
  | ArticleSchema
  | PersonSchema;

export interface SchemaGraph {
  "@context": string;
  "@graph": SchemaItem[];
}

export type PageType = EPageType.HOME | EPageType.SERVICE | EPageType.OTHER;

export type PageProps = {
  attributes?: {
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      image?: {
        data?: {
          id?: number;
          attributes?: {
            name?: string;
            alternativeText?: string;
            caption?: string;
            width?: number;
            height?: number;
            formats?: unknown;
            hash?: string;
            ext?: string;
            mime?: string;
            /** Format: float */
            size?: number;
            url?: string;
            previewUrl?: string;
            provider?: string;
            provider_metadata?: unknown;
            related?: {
              data?: {
                id?: number;
                attributes?: Record<string, never>;
              }[];
            };
            folder?: {
              data?: {
                id?: number;
                attributes?: {
                  name?: string;
                  pathId?: number;
                  parent?: {
                    data?: {
                      id?: number;
                      attributes?: Record<string, never>;
                    };
                  };
                  children?: {
                    data?: {
                      id?: number;
                      attributes?: Record<string, never>;
                    }[];
                  };
                  files?: {
                    data?: {
                      id?: number;
                      attributes?: {
                        name?: string;
                        alternativeText?: string;
                        caption?: string;
                        width?: number;
                        height?: number;
                        formats?: unknown;
                        hash?: string;
                        ext?: string;
                        mime?: string;
                        /** Format: float */
                        size?: number;
                        url?: string;
                        previewUrl?: string;
                        provider?: string;
                        provider_metadata?: unknown;
                        related?: {
                          data?: {
                            id?: number;
                            attributes?: Record<string, never>;
                          }[];
                        };
                        folder?: {
                          data?: {
                            id?: number;
                            attributes?: Record<string, never>;
                          };
                        };
                        folderPath?: string;
                        /** Format: date-time */
                        createdAt?: string;
                        /** Format: date-time */
                        updatedAt?: string;
                        createdBy?: {
                          data?: {
                            id?: number;
                            attributes?: {
                              firstname?: string;
                              lastname?: string;
                              username?: string;
                              /** Format: email */
                              email?: string;
                              resetPasswordToken?: string;
                              registrationToken?: string;
                              isActive?: boolean;
                              roles?: {
                                data?: {
                                  id?: number;
                                  attributes?: {
                                    name?: string;
                                    code?: string;
                                    description?: string;
                                    users?: {
                                      data?: {
                                        id?: number;
                                        attributes?: Record<string, never>;
                                      }[];
                                    };
                                    permissions?: {
                                      data?: {
                                        id?: number;
                                        attributes?: {
                                          action?: string;
                                          actionParameters?: unknown;
                                          subject?: string;
                                          properties?: unknown;
                                          conditions?: unknown;
                                          role?: {
                                            data?: {
                                              id?: number;
                                              attributes?: Record<
                                                string,
                                                never
                                              >;
                                            };
                                          };
                                          /** Format: date-time */
                                          createdAt?: string;
                                          /** Format: date-time */
                                          updatedAt?: string;
                                          createdBy?: {
                                            data?: {
                                              id?: number;
                                              attributes?: Record<
                                                string,
                                                never
                                              >;
                                            };
                                          };
                                          updatedBy?: {
                                            data?: {
                                              id?: number;
                                              attributes?: Record<
                                                string,
                                                never
                                              >;
                                            };
                                          };
                                        };
                                      }[];
                                    };
                                    /** Format: date-time */
                                    createdAt?: string;
                                    /** Format: date-time */
                                    updatedAt?: string;
                                    createdBy?: {
                                      data?: {
                                        id?: number;
                                        attributes?: Record<string, never>;
                                      };
                                    };
                                    updatedBy?: {
                                      data?: {
                                        id?: number;
                                        attributes?: Record<string, never>;
                                      };
                                    };
                                  };
                                }[];
                              };
                              blocked?: boolean;
                              preferedLanguage?: string;
                              /** Format: date-time */
                              createdAt?: string;
                              /** Format: date-time */
                              updatedAt?: string;
                              createdBy?: {
                                data?: {
                                  id?: number;
                                  attributes?: Record<string, never>;
                                };
                              };
                              updatedBy?: {
                                data?: {
                                  id?: number;
                                  attributes?: Record<string, never>;
                                };
                              };
                            };
                          };
                        };
                        updatedBy?: {
                          data?: {
                            id?: number;
                            attributes?: Record<string, never>;
                          };
                        };
                      };
                    }[];
                  };
                  path?: string;
                  /** Format: date-time */
                  createdAt?: string;
                  /** Format: date-time */
                  updatedAt?: string;
                  createdBy?: {
                    data?: {
                      id?: number;
                      attributes?: Record<string, never>;
                    };
                  };
                  updatedBy?: {
                    data?: {
                      id?: number;
                      attributes?: Record<string, never>;
                    };
                  };
                };
              };
            };
            folderPath?: string;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
            createdBy?: {
              data?: {
                id?: number;
                attributes?: Record<string, never>;
              };
            };
            updatedBy?: {
              data?: {
                id?: number;
                attributes?: Record<string, never>;
              };
            };
          };
        };
      };
    };
    localizations?: {
      data?: {
        attributes?: {
          locale?: string;
        };
      }[];
    };
  };
};
