export enum ECreationTypes {
  CONVERTER = "CONVERTER",
  OCR = "OCR",
  TRANSLATE = "TRANSLATE",
  REMOVE_WATERMARK = "REMOVE_WATERMARK",
  UNLOCK = "UNLOCK",
}

export const isCreationTypeEvent = (
  value: string | undefined
): value is ECreationTypes =>
  Object.values(ECreationTypes).includes(value as ECreationTypes);
