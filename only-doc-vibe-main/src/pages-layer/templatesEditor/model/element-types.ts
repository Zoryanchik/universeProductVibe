export interface UploadListImage {
  id: string;
  src: string;
  checked?: boolean;
  elementProps?: Record<string, unknown>;
}

export type TextPreset = {
  text: string;
  fontSize: number;
  fontWeight?: string;
  fontFamily?: string;
};
