import type { InternalFileType } from "../../../constants/file-type";

export interface BottomCtaSectionProps {
  readonly title: string;
  readonly subtitle: string;
  readonly buttonLabel: string;
  readonly onFileUpload?: (files: FileList) => void;
  readonly acceptedFormats: InternalFileType[];
  readonly className?: string;
}
