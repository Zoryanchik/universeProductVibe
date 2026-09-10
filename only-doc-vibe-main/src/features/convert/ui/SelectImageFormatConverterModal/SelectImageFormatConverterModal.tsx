import type { FC } from "react";

import type { InternalFileType } from "@/shared/constants/file-type";

export interface ISelectImageFormatConverterModalOptions {
  formatFrom: InternalFileType;
  onSubmit: (options: { formatTo: InternalFileType }) => void;
}

export const SelectImageFormatConverterModal: FC = () => {
  return <></>;
};
