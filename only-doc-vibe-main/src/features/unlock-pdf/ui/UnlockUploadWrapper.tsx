import { useCallback, type FC, type PropsWithChildren } from "react";

import { CustomSlot } from "@/shared/ui/CustomSlot";
import type { InternalFileType } from "@/shared/constants/file-type";

import {
  useDefaultUploadFileValidation,
  type EFunnels,
  type EServiceType,
} from "@/entities/documents";

import { useUnlockPdf } from "../model/hooks/useUnlockPdf";

interface Props extends PropsWithChildren {
  serviceType: EServiceType;
  funnel: EFunnels;
  acceptedFormats: InternalFileType[];
}

export const UnlockUploadWrapper: FC<Props> = ({
  serviceType,
  funnel,
  acceptedFormats,
  children,
}) => {
  const unlockPdf = useUnlockPdf({ serviceType, funnel });

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

      unlockPdf(file);
    },
    [unlockPdf, validate]
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
