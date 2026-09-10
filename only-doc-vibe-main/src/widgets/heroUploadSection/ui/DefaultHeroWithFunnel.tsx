"use client";

import type { ComponentProps, FC } from "react";

import { EModalsTypes } from "@/shared/constants/modals-keys";
import { useModalsStore } from "@/shared/lib/modals/modals-store";

import { EnhanceImageResultSection } from "@/features/enhance-image";
import { withFunnelUpload } from "@/features/funnelUpload";
import { RemoveImageWatermarkResultSection } from "@/features/remove-watermark";

import { DefaultHero } from "./DefaultHero";

const DefaultHeroUpload = withFunnelUpload(DefaultHero);

type DefaultHeroWithFunnelProps = ComponentProps<typeof DefaultHeroUpload>;

export const DefaultHeroWithFunnel: FC<DefaultHeroWithFunnelProps> = (
  props
) => {
  const isModalOpen = useModalsStore.use.open();
  const modalType = useModalsStore.use.type();

  if (isModalOpen && modalType === EModalsTypes.REMOVE_IMAGE_WATERMARK_MODAL) {
    return <RemoveImageWatermarkResultSection />;
  }

  if (isModalOpen && modalType === EModalsTypes.ENHANCE_IMAGE_MODAL) {
    return <EnhanceImageResultSection />;
  }

  return <DefaultHeroUpload {...props} />;
};
