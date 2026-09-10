import { ECompressionLevel } from "../model/constants/compression-level";

type CompressionRate = {
  range: [number, number];
} & Record<ECompressionLevel, number>;

const COMPRESSION_RATES: CompressionRate[] = [
  {
    range: [0, 1],
    [ECompressionLevel.HIGH]: 54.29,
    [ECompressionLevel.MEDIUM]: 47.21,
    [ECompressionLevel.LOW]: 40.13,
  },
  {
    range: [1, 5],
    [ECompressionLevel.HIGH]: 73.11,
    [ECompressionLevel.MEDIUM]: 63.57,
    [ECompressionLevel.LOW]: 54.04,
  },
  {
    range: [5, 10],
    [ECompressionLevel.HIGH]: 77.16,
    [ECompressionLevel.MEDIUM]: 67.1,
    [ECompressionLevel.LOW]: 57.03,
  },
  {
    range: [10, 20],
    [ECompressionLevel.HIGH]: 85.03,
    [ECompressionLevel.MEDIUM]: 73.93,
    [ECompressionLevel.LOW]: 62.84,
  },
  {
    range: [20, 30],
    [ECompressionLevel.HIGH]: 89.01,
    [ECompressionLevel.MEDIUM]: 77.4,
    [ECompressionLevel.LOW]: 65.79,
  },
  {
    range: [30, 40],
    [ECompressionLevel.HIGH]: 89.58,
    [ECompressionLevel.MEDIUM]: 77.9,
    [ECompressionLevel.LOW]: 66.21,
  },
  {
    range: [40, 50],
    [ECompressionLevel.HIGH]: 89.99,
    [ECompressionLevel.MEDIUM]: 78.25,
    [ECompressionLevel.LOW]: 66.51,
  },
  {
    range: [50, 100],
    [ECompressionLevel.HIGH]: 94.35,
    [ECompressionLevel.MEDIUM]: 82.04,
    [ECompressionLevel.LOW]: 69.73,
  },
  {
    range: [100, Infinity],
    [ECompressionLevel.HIGH]: 68.64,
    [ECompressionLevel.MEDIUM]: 59.69,
    [ECompressionLevel.LOW]: 50.74,
  },
];

export function getCompressedSize(
  fileSizeBytes: number,
  compressionLevel: ECompressionLevel
) {
  if (fileSizeBytes <= 0)
    return { compressedSize: 0, percentageDecrease: 0, sizeUnit: "KB" };

  const fileSizeMB = fileSizeBytes / (1024 * 1024);

  const rate = COMPRESSION_RATES.find(
    (entry) => fileSizeMB >= entry.range[0] && fileSizeMB < entry.range[1]
  );

  if (!rate)
    return { compressedSize: 0, percentageDecrease: 0, sizeUnit: "KB" };

  const compressionRate = rate[compressionLevel];
  const compressedSizeMB = fileSizeMB * ((100 - compressionRate) / 100);

  if (fileSizeMB >= 1) {
    return {
      compressedSize: Number(compressedSizeMB.toFixed(2)),
      percentageDecrease: compressionRate,
      sizeUnit: "MB",
    };
  } else {
    return {
      compressedSize: Number((compressedSizeMB * 1024).toFixed(1)),
      percentageDecrease: compressionRate,
      sizeUnit: "KB",
    };
  }
}

export const formatOriginalSize = (fileSizeBytes: number) => {
  if (fileSizeBytes <= 0) return "0 KB";

  const oneMB = 1024 * 1024;
  const fileSizeMB = fileSizeBytes / oneMB;

  if (fileSizeMB >= 1) {
    return `${fileSizeMB.toFixed(2)} MB`;
  } else {
    const fileSizeKB = fileSizeBytes / 1024;

    return `${fileSizeKB.toFixed(2)} KB`;
  }
};
