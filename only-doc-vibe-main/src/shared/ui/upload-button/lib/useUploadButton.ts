"use client";

import { useCallback, useRef, useMemo } from "react";

import type { InternalFileType } from "../../../constants/file-type";
import {
  EAnalyticsEvents,
  normalizeFeatureName,
  trackEvent,
} from "../../../lib/analytics";
import { getAcceptString } from "../../../lib/file";

interface IUseUploadButtonParams {
  readonly onFileUpload?: (files: FileList) => void;
  readonly acceptedFormats: InternalFileType[];
  readonly analyticsFeatureName?: string;
}

interface IUseUploadButtonReturn {
  readonly fileInputRef: React.RefObject<HTMLInputElement | null>;
  readonly handleClick: () => void;
  readonly handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly acceptString: string;
}

export const useUploadButton = ({
  onFileUpload,
  acceptedFormats,
  analyticsFeatureName,
}: IUseUploadButtonParams): IUseUploadButtonReturn => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const acceptString = useMemo(
    () => getAcceptString(acceptedFormats ?? []),
    [acceptedFormats]
  );

  const handleClick = useCallback(() => {
    trackEvent(EAnalyticsEvents.FEATURES_TAP, {
      feature_name: analyticsFeatureName
        ? normalizeFeatureName(analyticsFeatureName)
        : undefined,
    });
    fileInputRef.current?.click();
  }, [analyticsFeatureName]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;

      if (files && files.length > 0) {
        onFileUpload?.(files);
      }

      // Reset input value to allow selecting the same file again
      e.target.value = "";
    },
    [onFileUpload]
  );

  return {
    fileInputRef,
    handleClick,
    handleFileChange,
    acceptString,
  };
};
