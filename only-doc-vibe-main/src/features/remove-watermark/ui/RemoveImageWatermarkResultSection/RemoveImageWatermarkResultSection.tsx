"use client";

import type { FC } from "react";

import { EModalsTypes } from "@/shared/constants/modals-keys";
import { useCurrentModalOptions } from "@/shared/lib/modals/modals-store";

import { RemoveImageWatermarkPreviewContent } from "../RemoveImageWatermarkPreviewContent";

export const RemoveImageWatermarkResultSection: FC = () => {
  const options = useCurrentModalOptions(
    EModalsTypes.REMOVE_IMAGE_WATERMARK_MODAL
  );

  if (!options) return null;

  return (
    <div className="w-full rounded-[40px] bg-[#FAFAFA] p-4 md:p-8">
      <RemoveImageWatermarkPreviewContent
        removedWatermarkImageUrl={options.removedWatermarkImageUrl}
        originalImageUrl={options.originalImageUrl}
        acceptFormats={options.acceptFormats}
        onDownload={options.onDownload}
        handleUploadFile={options.handleUploadFile}
      />
    </div>
  );
};
