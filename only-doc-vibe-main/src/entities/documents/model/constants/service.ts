export enum EServiceType {
  CONVERTOR = "CONVERTOR",
  COMPRESSOR = "COMPRESSOR",
  OCR = "OCR",
  TRANSLATE = "TRANSLATE",
  REMOVE_WATERMARK = "REMOVE_WATERMARK",
  UNLOCK_PDF = "UNLOCK_PDF",
  ENHANCE_IMAGE = "ENHANCE_IMAGE",
  EDITOR = "EDITOR",
  AI_SUMMARIZER = "AI_SUMMARIZER",
}

const ESERVICE_TYPE_VALUES = Object.values(EServiceType);

export const isServiceType = (value: unknown): value is EServiceType => {
  return ESERVICE_TYPE_VALUES.includes(value as EServiceType);
};
