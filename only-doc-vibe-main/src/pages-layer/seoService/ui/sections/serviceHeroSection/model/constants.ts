import { InternalFileType } from "@/shared/constants/file-type";

export const DEFAULT_ACCEPTED_FORMATS: InternalFileType[] = [
  InternalFileType.PDF,
];

// Re-export from shared for backwards compatibility
export { getAcceptString } from "@/shared/lib/file";
