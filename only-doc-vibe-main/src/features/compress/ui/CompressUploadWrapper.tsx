import { useCallback, type FC, type PropsWithChildren } from "react";

import { CustomSlot } from "@/shared/ui/CustomSlot";
import type { InternalFileType } from "@/shared/constants/file-type";

import {
  useDefaultUploadFileValidation,
  type EFunnels,
  type EServiceType,
} from "@/entities/documents";

import { useCompressPdf } from "../model/hooks/useCompressPdf";

interface Props extends PropsWithChildren {
  serviceType: EServiceType;
  funnel: EFunnels;
  acceptedFormats: InternalFileType[];
}

export const CompressUploadWrapper: FC<Props> = ({
  serviceType,
  funnel,
  acceptedFormats,
  children,
}) => {
  const compress = useCompressPdf({ serviceType, funnel });

  const { validate, error, setError } = useDefaultUploadFileValidation({
    acceptedFormats,
    funnel,
  });

  const onFileUpload = useCallback(
    async (files: FileList) => {
      // Extract file IMMEDIATELY before any async operations
      // FileList is a live DOM reference that gets cleared when input.value is reset
      const file = files[0];
      if (!file) return;

      const isValid = await validate(files);
      if (!isValid) return;

      compress(file);
    },
    [compress, validate]
  );

  return (
    <CustomSlot
      validationError={error}
      setValidationError={setError}
      onFileUpload={onFileUpload}
    >
      {children}
    </CustomSlot>
  );
};
