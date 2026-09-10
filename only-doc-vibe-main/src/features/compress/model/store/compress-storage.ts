import { appStorage } from "@/shared/lib/storage/app-storage";
import { LOCAL_STORAGE_KEYS } from "@/shared/constants/local-storage-keys";

import {
  isCompressionLevel,
  type ECompressionLevel,
} from "../constants/compression-level";

export const CompressStorage = {
  getCompressionLevel: (): ECompressionLevel | null => {
    const compressionLevel = appStorage.getItem(
      LOCAL_STORAGE_KEYS.COMPRESSION_LEVEL
    );

    if (isCompressionLevel(compressionLevel)) {
      return compressionLevel;
    }

    return null;
  },
  setCompressionLevel: (compressionLevel: ECompressionLevel) => {
    appStorage.setItem(LOCAL_STORAGE_KEYS.COMPRESSION_LEVEL, compressionLevel);
  },
  clearCompressionLevel: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.COMPRESSION_LEVEL);
  },

  getCompressedSize: (): number | null => {
    const compressedSize = Number(
      appStorage.getItem(LOCAL_STORAGE_KEYS.COMPRESSED_SIZE)
    );

    if (Number.isNaN(compressedSize)) return null;

    return compressedSize;
  },
  setCompressedSize: (compressedSize: number) => {
    appStorage.setItem(
      LOCAL_STORAGE_KEYS.COMPRESSED_SIZE,
      String(compressedSize)
    );
  },
  clearCompressedSize: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.COMPRESSED_SIZE);
  },

  getCompressedPercentage: (): number | null => {
    const compressedPercentage = Number(
      appStorage.getItem(LOCAL_STORAGE_KEYS.COMPRESSED_PERCENTAGE)
    );

    if (Number.isNaN(compressedPercentage)) return null;

    return compressedPercentage;
  },
  setCompressedPercentage: (compressedPercentage: number) => {
    appStorage.setItem(
      LOCAL_STORAGE_KEYS.COMPRESSED_PERCENTAGE,
      String(compressedPercentage)
    );
  },
  clearCompressedPercentage: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.COMPRESSED_PERCENTAGE);
  },

  getSizeUnit: (): string | null => {
    const sizeUnit = appStorage.getItem(LOCAL_STORAGE_KEYS.SIZE_UNIT);

    return sizeUnit || null;
  },
  setSizeUnit: (sizeUnit: string) => {
    appStorage.setItem(LOCAL_STORAGE_KEYS.SIZE_UNIT, sizeUnit);
  },
  clearSizeUnit: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.SIZE_UNIT);
  },

  getInitialFileSizeText: (): string | null => {
    const initialFileSizeText = appStorage.getItem(
      LOCAL_STORAGE_KEYS.INITIAL_FILE_SIZE_TEXT
    );

    return initialFileSizeText || null;
  },
  setInitialFileSizeText: (initialFileSizeText: string) => {
    appStorage.setItem(
      LOCAL_STORAGE_KEYS.INITIAL_FILE_SIZE_TEXT,
      initialFileSizeText
    );
  },
  clearInitialFileSizeText: () => {
    appStorage.removeItem(LOCAL_STORAGE_KEYS.INITIAL_FILE_SIZE_TEXT);
  },

  clearAll: () => {
    CompressStorage.clearCompressionLevel();
    CompressStorage.clearCompressedSize();
    CompressStorage.clearCompressedPercentage();
    CompressStorage.clearSizeUnit();
    CompressStorage.clearInitialFileSizeText();
  },
};
