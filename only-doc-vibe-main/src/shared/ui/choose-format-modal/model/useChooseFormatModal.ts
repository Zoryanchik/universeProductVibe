import { useMemo, useState } from "react";

import { EModalsTypes } from "../../../constants/modals-keys";
import {
  closeModal,
  useCurrentModalOptions,
} from "../../../lib/modals/modals-store";
import type { InternalFileType } from "../../../constants/file-type";
import {
  DEFAULT_FORMATS_DICTIONARY,
  FORMATS_DICTIONARY,
  createFormatOption,
  type IFormatDictionaryOption,
} from "./constants";
import type { IChooseFormatAndConvertModalOptions } from "./types";

interface IUseNavbarProps {
  // State
  filename: string;
  currentFormat: InternalFileType;
  dynamicFormatsList: IFormatDictionaryOption[];
  // Actions
  setFilename: (name: string) => void;
  setCurrentFormat: (format: InternalFileType) => void;
  handleCancel: () => void;
  handleSubmit: () => void;
}

export const useChooseFormanModal = (): IUseNavbarProps => {
  const {
    filename: initialFilename,
    formatFrom,
    defaultFormatTo,
    onSubmit,
  }: IChooseFormatAndConvertModalOptions = useCurrentModalOptions(
    EModalsTypes.CHOOSE_FORMAT_PDF_CONVERTER_MODAL
  );

  const [filename, setFilename] = useState<string>(initialFilename);

  const dynamicFormatsList = useMemo(() => {
    const baseFormats =
      FORMATS_DICTIONARY[formatFrom] || DEFAULT_FORMATS_DICTIONARY;

    if (!defaultFormatTo) {
      return baseFormats;
    }

    const exists = baseFormats.some((format) => format.to === defaultFormatTo);

    if (exists) {
      return baseFormats;
    }

    // Ensure route-specific target format is always available in PDF->* flow.
    return [...baseFormats, createFormatOption(defaultFormatTo)];
  }, [defaultFormatTo, formatFrom]);

  const [currentFormat, setCurrentFormat] = useState<InternalFileType>(() => {
    if (defaultFormatTo) {
      const exists = dynamicFormatsList.some((f) => f.to === defaultFormatTo);
      if (exists) return defaultFormatTo;
    }

    return dynamicFormatsList[0].to;
  });

  const handleCancel = () => {
    closeModal(EModalsTypes.CHOOSE_FORMAT_PDF_CONVERTER_MODAL);
  };

  const handleSubmit = () => {
    onSubmit({ formatTo: currentFormat, filename });
  };

  return {
    // State
    filename,
    currentFormat,
    dynamicFormatsList,
    // Actions
    setFilename,
    setCurrentFormat,
    handleCancel,
    handleSubmit,
  };
};
