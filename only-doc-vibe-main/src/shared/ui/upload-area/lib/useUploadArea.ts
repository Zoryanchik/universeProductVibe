"use client";

import { useCallback, useRef, useState, useMemo } from "react";

import {
  EAnalyticsEvents,
  normalizeFeatureName,
  trackEvent,
} from "../../../lib/analytics";
import { getAcceptString } from "../../../lib/file";
import type {
  IUseUploadAreaParams,
  IUseUploadAreaReturn,
} from "../model/types";

export const useUploadArea = ({
  onFileUpload,
  acceptedFormats,
  setValidationError,
  analyticsFeatureName,
}: IUseUploadAreaParams): IUseUploadAreaReturn => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const acceptString = useMemo(
    () => getAcceptString(acceptedFormats),
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

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const { files } = e.dataTransfer;

      if (files && files.length > 0) {
        trackEvent(EAnalyticsEvents.FEATURES_TAP_DND);
        setValidationError?.(null);
        onFileUpload?.(files);
      }
    },
    [onFileUpload, setValidationError]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;

      if (files && files.length > 0) {
        setValidationError?.(null);
        onFileUpload?.(files);
      }

      e.target.value = "";
    },
    [onFileUpload, setValidationError]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return {
    fileInputRef,
    isHovered,
    isDragOver,
    handleClick,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    handleMouseEnter,
    handleMouseLeave,
    acceptString,
  };
};
