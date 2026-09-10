import type { components } from "@/shared/api/cms/cms-schema";
import type {
  CmsModalContentMap,
  ConvertModalContent,
} from "@/shared/lib/cms-modal-content";
import type { SectionComponent } from "@/shared/types/seo/sections";

import { ECMSSectionComponent } from "../constants";

type GlobalElement = components["schemas"]["GlobalElement"];
type CmsImageItem = components["schemas"]["CommonImageItemComponent"];

const MODAL_COMPONENT_KEYS = new Set<string>([
  ECMSSectionComponent.MODAL_TRANSLATE,
  ECMSSectionComponent.MODAL_COMPRESS,
  ECMSSectionComponent.MODAL_CONVERT,
  ECMSSectionComponent.MODAL_REMOVE_WATERMARK,
  ECMSSectionComponent.MODAL_OCR,
  ECMSSectionComponent.MODAL_UPLOAD_PROCESSING,
]);

export const isModalSection = (component: string): boolean =>
  MODAL_COMPONENT_KEYS.has(component);

/**
 * At runtime `global_element` is fetched separately by documentId
 * but the auto-generated schema types only show the bare relation.
 * This helper extracts formats from the first widget.
 */
const extractFormatsFromGlobalElement = (
  raw: unknown
): CmsImageItem[] | undefined => {
  const ge = raw as GlobalElement | undefined;

  return ge?.widgets?.[0]?.formats;
};

const enrichConvertModal = (
  raw: Record<string, unknown>
): ConvertModalContent => ({
  ...(raw as components["schemas"]["ModalsConvertModalComponent"]),
  formats: extractFormatsFromGlobalElement(raw.global_element),
});

export const extractCmsModalData = (
  sections: SectionComponent[]
): Partial<CmsModalContentMap> => {
  const data: Partial<CmsModalContentMap> = {};

  for (const section of sections) {
    const key = section.__component;

    if (MODAL_COMPONENT_KEYS.has(key)) {
      if (key === ECMSSectionComponent.MODAL_CONVERT) {
        data["modals.convert-modal"] = enrichConvertModal(
          section as unknown as Record<string, unknown>
        );
      } else {
        (data as Record<string, unknown>)[key] = section;
      }
    }

    if (key === ECMSSectionComponent.HERO_SECTION) {
      const heroData =
        section as components["schemas"]["SectionsHeroSectionComponent"];

      if (heroData.upload_processing_modal) {
        data["modals.upload-processing-modal"] =
          heroData.upload_processing_modal;
      }

      if (heroData.convert_modal) {
        data["modals.convert-modal"] = enrichConvertModal(
          heroData.convert_modal as unknown as Record<string, unknown>
        );
      }
    }
  }

  return data;
};
