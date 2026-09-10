import { create } from "zustand";

import { createSelectors } from "@/shared/lib/state/createSelectors";

import type { ECompressionLevel } from "../constants/compression-level";
import { CompressStorage } from "./compress-storage";

interface ICompressStore {
  compressionLevel: ECompressionLevel | null;
  compressedSize: number | null;
  compressedPercentage: number | null;
  sizeUnit: string | null;
  initialFileSizeText: string | null;
}

const getInitialState = () => ({
  compressionLevel: CompressStorage.getCompressionLevel(),
  compressedSize: CompressStorage.getCompressedSize(),
  compressedPercentage: CompressStorage.getCompressedPercentage(),
  sizeUnit: CompressStorage.getSizeUnit(),
  initialFileSizeText: CompressStorage.getInitialFileSizeText(),
});

const compressStore = create<ICompressStore>(() => getInitialState());

export const setCompressionLevel = (compressionLevel: ECompressionLevel) => {
  CompressStorage.setCompressionLevel(compressionLevel);
  compressStore.setState({ compressionLevel });
};

export const setCompressedSize = (compressedSize: number) => {
  CompressStorage.setCompressedSize(compressedSize);
  compressStore.setState({ compressedSize });
};

export const setCompressedPercentage = (compressedPercentage: number) => {
  CompressStorage.setCompressedPercentage(compressedPercentage);
  compressStore.setState({ compressedPercentage });
};

export const setSizeUnit = (sizeUnit: string) => {
  CompressStorage.setSizeUnit(sizeUnit);
  compressStore.setState({ sizeUnit });
};

export const setInitialFileSizeText = (initialFileSizeText: string) => {
  CompressStorage.setInitialFileSizeText(initialFileSizeText);
  compressStore.setState({ initialFileSizeText });
};

export const setCompressionData = (data: {
  compressionLevel: ECompressionLevel;
  compressedSize: number;
  compressedPercentage: number;
  sizeUnit: string;
  initialFileSizeText: string;
}) => {
  CompressStorage.setCompressionLevel(data.compressionLevel);
  CompressStorage.setCompressedSize(data.compressedSize);
  CompressStorage.setCompressedPercentage(data.compressedPercentage);
  CompressStorage.setSizeUnit(data.sizeUnit);
  CompressStorage.setInitialFileSizeText(data.initialFileSizeText);

  compressStore.setState({
    compressionLevel: data.compressionLevel,
    compressedSize: data.compressedSize,
    compressedPercentage: data.compressedPercentage,
    sizeUnit: data.sizeUnit,
    initialFileSizeText: data.initialFileSizeText,
  });
};

export const clearCompressStorage = () => {
  CompressStorage.clearAll();
  compressStore.setState(getInitialState());
};

export const useCompressStore = createSelectors(compressStore);
