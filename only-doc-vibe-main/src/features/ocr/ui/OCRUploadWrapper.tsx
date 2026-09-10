import { useCallback, type FC, type PropsWithChildren } from "react";

import { CustomSlot } from "@/shared/ui/CustomSlot";
import type { InternalFileType } from "@/shared/constants/file-type";

import {
  useDefaultUploadFileValidation,
  type EFunnels,
  type EServiceType,
} from "@/entities/documents";

import { useOcr } from "../model/useOcr";

interface Props extends PropsWithChildren {
  serviceType: EServiceType;
  funnel: EFunnels;
  acceptedFormats: InternalFileType[];
}

export const OCRUploadWrapper: FC<Props> = ({
  serviceType,
  funnel,
  acceptedFormats,
  children,
}) => {
  const { validate, error, setError } = useDefaultUploadFileValidation({
    acceptedFormats,
    validatePasswordProtected: true,
    funnel,
  });
  const ocr = useOcr({ serviceType, funnel });

  const onFileUpload = useCallback(
    async (files: FileList) => {
      // Extract file IMMEDIATELY before any async operations
      // FileList is a live DOM reference that gets cleared when input.value is reset
      const file = files[0];
      if (!file) return;

      const isValid = await validate(files);
      if (!isValid) return;

      ocr(file);
    },
    [ocr, validate]
  );

  return (
    <CustomSlot
      onFileUpload={onFileUpload}
      validationError={error}
      setValidationError={setError}
    >
      {children}
    </CustomSlot>
  );
};
