import { useCallback, type FC, type PropsWithChildren } from "react";

import { InternalFileType } from "@/shared/constants/file-type";
import { CustomSlot } from "@/shared/ui/CustomSlot";

import {
  useDefaultUploadFileValidation,
  type EFunnels,
  type EServiceType,
} from "@/entities/documents";

import { useTranslatePdf } from "../model/useTranslatePdf";

interface Props extends PropsWithChildren {
  serviceType: EServiceType;
  funnel: EFunnels;
  formatTo?: InternalFileType;
  acceptedFormats: InternalFileType[];
}

export const TranslateUploadWrapper: FC<Props> = ({
  serviceType,
  funnel,
  formatTo = InternalFileType.PDF,
  acceptedFormats,
  children,
}) => {
  const { validate, error, setError } = useDefaultUploadFileValidation({
    acceptedFormats,
    funnel,
  });
  const translateFile = useTranslatePdf({ serviceType, funnel, formatTo });

  const onFileUpload = useCallback(
    async (files: FileList) => {
      // Extract file IMMEDIATELY before any async operations
      // FileList is a live DOM reference that gets cleared when input.value is reset
      const file = files[0];
      if (!file) return;

      const isValid = await validate(files);
      if (!isValid) return;

      translateFile(file);
    },
    [translateFile, validate]
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
