"use client";

import type { FC } from "react";

import { EModalsTypes } from "@/shared/constants/modals-keys";
import { useCurrentModalOptions } from "@/shared/lib/modals/modals-store";

import { EnhanceImagePreviewContent } from "../EnhanceImagePreviewContent";

export const EnhanceImageResultSection: FC = () => {
  const options = useCurrentModalOptions(EModalsTypes.ENHANCE_IMAGE_MODAL);

  if (!options) return null;

  return <EnhanceImagePreviewContent {...options} />;
};
