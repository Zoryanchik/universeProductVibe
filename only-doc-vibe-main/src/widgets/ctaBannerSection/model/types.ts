import type { InternalFileType } from "@/shared/constants/file-type";

import type { EFunnels, EServiceType } from "@/entities/documents";

export interface ICTABadge {
  readonly id: string;
  readonly label: string;
}

export interface ICTABannerSectionProps {
  readonly title: string;
  readonly badges: readonly ICTABadge[];
  readonly buttonLabel: string;
  readonly serviceType: EServiceType;
  readonly funnel: EFunnels;
  readonly formatTo?: InternalFileType;
  readonly acceptedFormats: InternalFileType[];
}
