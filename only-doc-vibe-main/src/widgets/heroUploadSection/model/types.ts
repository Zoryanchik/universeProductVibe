import type { InternalFileType } from "@/shared/constants/file-type";

import type { EFunnels, EServiceType } from "@/entities/documents";

export interface IHeroUploadSectionProps {
  readonly title: string;
  readonly subtitle: string;
  readonly uploadButtonLabel: string;
  readonly dropText: string;
  readonly supportedFormatsText: string;
  readonly maxSizeText: string;
  readonly serviceType: EServiceType;
  readonly funnel: EFunnels;
  readonly formatTo?: InternalFileType;
  readonly acceptedFormats: InternalFileType[];
}
