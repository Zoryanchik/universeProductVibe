export interface StrapiImage {
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
}
