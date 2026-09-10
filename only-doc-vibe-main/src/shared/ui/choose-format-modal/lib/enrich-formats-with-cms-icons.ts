import type { components } from "../../../api/cms/cms-schema";
import { InternalFileType } from "../../../constants/file-type";
import {
  createFormatOption,
  type IFormatDictionaryOption,
} from "../model/constants";

type CmsFormatItem = components["schemas"]["CommonImageItemComponent"];

const LABEL_TO_FILE_TYPE: Record<string, InternalFileType> = {
  excel: InternalFileType.XLSX,
  word: InternalFileType.DOCX,
  webp: InternalFileType.WEBP,
};

const ALL_FILE_TYPE_VALUES = new Set(
  Object.values(InternalFileType) as string[]
);

function resolveFileType(imageId: string): InternalFileType | undefined {
  const mapped = LABEL_TO_FILE_TYPE[imageId.toLowerCase()];
  if (mapped) return mapped;

  const upper = imageId.toUpperCase();
  if (ALL_FILE_TYPE_VALUES.has(upper)) return upper as InternalFileType;

  return undefined;
}

/**
 * When CMS formats are available, builds the full format list from them
 * (the GlobalElement becomes the source of truth for which formats appear).
 * Falls back to the hardcoded list when CMS data is unavailable.
 */
export const enrichFormatsWithCmsIcons = (
  formats: IFormatDictionaryOption[],
  cmsFormats: CmsFormatItem[] | undefined
): IFormatDictionaryOption[] => {
  if (!cmsFormats?.length) return formats;

  const cmsOptions: IFormatDictionaryOption[] = [];

  for (const item of cmsFormats) {
    if (!item.image_id) continue;

    const fileType = resolveFileType(item.image_id);
    if (!fileType) continue;

    const base = createFormatOption(fileType);

    cmsOptions.push({
      ...base,
      label: item.image_id,
      icon: item.image?.url ?? base.icon,
    });
  }

  return cmsOptions.length > 0 ? cmsOptions : formats;
};
