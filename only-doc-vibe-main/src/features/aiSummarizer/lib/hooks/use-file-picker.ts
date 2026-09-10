import { useCallback, useMemo, useRef } from "react";

import { useAiSummarizerStore } from "../../model/store/ai-summarizer-store";
import { buildFilePickerAccept } from "../derive-cms-config";

export interface UseFilePickerResult {
  inputRef: React.RefObject<HTMLInputElement | null>;
  acceptAttribute: string;
  openPicker: () => void;
  handleFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    onFile: (file: File) => void
  ) => void;
}

export const useFilePicker = (): UseFilePickerResult => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cmsConfig = useAiSummarizerStore.use.cmsConfig();

  const acceptAttribute = useMemo(
    () => buildFilePickerAccept(cmsConfig?.acceptedFormats ?? []),
    [cmsConfig?.acceptedFormats]
  );

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, onFile: (file: File) => void) => {
      const file = e.target.files?.[0];
      if (file) onFile(file);

      e.target.value = "";
    },
    []
  );

  return { inputRef, acceptAttribute, openPicker, handleFileChange };
};
