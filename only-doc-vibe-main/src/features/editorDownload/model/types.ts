export type DownloadFormat = "pdf" | "png" | "jpeg";
export type DownloadScope = "all" | "current";
export type DownloadDpi = 72 | 150 | 300;

export interface DownloadFormState {
  filename: string;
  format: DownloadFormat;
  scope: DownloadScope;
  quality: number;
  dpi: DownloadDpi;
  ignoreBlankEdges: boolean;
}
