import type { InternalFileType } from "../../constants/file-type";

export interface IUploadButtonProps {
  readonly label: string;
  readonly onFileUpload?: (files: FileList) => void;
  readonly acceptedFormats: InternalFileType[];
  readonly multiple?: boolean;
  readonly showGlow?: boolean;
  readonly showIcon?: boolean;
  readonly className?: string;
  readonly buttonClassName?: string;
}
