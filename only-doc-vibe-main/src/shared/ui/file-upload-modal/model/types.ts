export interface IFileUploadingModalOptions {
  onFinished?: () => void;
  downloadProgress: number;
  durationSeconds?: number;
  filename?: string;
}
