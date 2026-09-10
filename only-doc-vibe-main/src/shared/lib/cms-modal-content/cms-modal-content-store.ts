import { create } from "zustand";

import type { components } from "../../api/cms/cms-schema";

type CmsImageItem = components["schemas"]["CommonImageItemComponent"];

/**
 * Extended convert-modal content with formats flattened
 * from the populated `global_element.widgets[].formats`.
 */
export type ConvertModalContent =
  components["schemas"]["ModalsConvertModalComponent"] & {
    formats?: CmsImageItem[];
  };

export type CmsModalContentMap = {
  "modals.translate-modal": components["schemas"]["ModalsTranslateModalComponent"];
  "modals.compress-modal": components["schemas"]["ModalsCompressModalComponent"];
  "modals.convert-modal": ConvertModalContent;
  "modals.remove-watermark-modal": components["schemas"]["ModalsRemoveWatermarkModalComponent"];
  "modals.ocr-modal": components["schemas"]["ModalsOcrModalComponent"];
  "modals.upload-processing-modal": components["schemas"]["ModalsUploadProcessingModalComponent"];
};

export type CmsModalComponentKey = keyof CmsModalContentMap;

interface ICmsModalContentState {
  data: Partial<CmsModalContentMap>;
}

const cmsModalContentStore = create<ICmsModalContentState>()(() => ({
  data: {},
}));

export const setCmsModalContent = (content: Partial<CmsModalContentMap>) => {
  cmsModalContentStore.setState({ data: content });
};

export const useCmsModalContent = <K extends CmsModalComponentKey>(
  key: K
): CmsModalContentMap[K] | null => {
  return (
    (cmsModalContentStore((s) => s.data[key]) as
      | CmsModalContentMap[K]
      | undefined) ?? null
  );
};
