import type { InternalFileType } from "../../../constants/file-type";

export interface IChooseFormatAndConvertModalOptions {
  filename: string;
  formatFrom: InternalFileType;
  defaultFormatTo?: InternalFileType;
  onSubmit: (options: { formatTo: InternalFileType; filename: string }) => void;
}
