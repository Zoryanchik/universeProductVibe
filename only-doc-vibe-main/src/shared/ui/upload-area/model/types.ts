import type { InternalFileType } from "../../../constants/file-type";

export interface ICmsDropZone {
  readonly title?: string;
  readonly supported_formats_description?: string;
  readonly supported_sizes_description?: string;
  readonly cta_button_title?: string;
}

export interface IUploadAreaProps {
  readonly buttonLabel: string;
  readonly supportedFormatsText: string;
  readonly maxSizeText: string;
  readonly dropText: string;
  readonly onFileUpload?: (files: FileList) => void;
  readonly validationError?: string | null;
  readonly setValidationError?: (error: string | null) => void;
  readonly acceptedFormats: InternalFileType[];
  readonly multiple?: boolean;
  readonly showUnlockIllustration?: boolean;
}

export interface IUseUploadAreaParams {
  readonly onFileUpload?: (files: FileList) => void;
  readonly acceptedFormats: InternalFileType[];
  readonly setValidationError?: (error: string | null) => void;
  readonly analyticsFeatureName?: string;
}

export interface IUseUploadAreaReturn {
  readonly fileInputRef: React.RefObject<HTMLInputElement | null>;
  readonly isHovered: boolean;
  readonly isDragOver: boolean;
  readonly handleClick: () => void;
  readonly handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  readonly handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  readonly handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  readonly handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly handleMouseEnter: () => void;
  readonly handleMouseLeave: () => void;
  readonly acceptString: string;
}
