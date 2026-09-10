import { useCallback, type FC, type PropsWithChildren } from "react";

import { CustomSlot } from "@/shared/ui/CustomSlot";
import type { InternalFileType } from "@/shared/constants/file-type";

import {
  useDefaultUploadFileValidation,
  type EFunnels,
  type EServiceType,
} from "@/entities/documents";

import { useEnhanceImage } from "../model/useEnhanceImage";

interface Props extends PropsWithChildren {
  serviceType: EServiceType;
  funnel: EFunnels;
  acceptedFormats: InternalFileType[];
}

export const EnhanceImageUploadWrapper: FC<Props> = ({
  serviceType,
  funnel,
  acceptedFormats,
  children,
}) => {
  const enhanceImage = useEnhanceImage({
    serviceType,
    funnel,
    acceptedFormats,
  });
  const { validate, error, setError } = useDefaultUploadFileValidation({
    acceptedFormats,
    funnel,
  });

  const onFileUpload = useCallback(
    async (files: FileList) => {
      const file = files[0];
      if (!file) return;

      const isValid = await validate(files);
      if (!isValid) return;

      enhanceImage(file);
    },
    [enhanceImage, validate]
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
