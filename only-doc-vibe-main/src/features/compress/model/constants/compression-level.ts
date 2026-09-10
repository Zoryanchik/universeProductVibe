export enum ECompressionLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export const ECOMPRESSION_LEVEL_VALUES = Object.values(ECompressionLevel);

export const isCompressionLevel = (
  value: unknown
): value is ECompressionLevel => {
  return ECOMPRESSION_LEVEL_VALUES.includes(value as ECompressionLevel);
};
