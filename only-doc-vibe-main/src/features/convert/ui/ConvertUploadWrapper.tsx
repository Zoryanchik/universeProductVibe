import { useCallback, type FC, type PropsWithChildren } from "react";

import { CustomSlot } from "@/shared/ui/CustomSlot";
import { isImageToPdfConvertFunnel } from "@/shared/lib/documents/isImageToPdfConvertFunnel";
import { InternalFileType } from "@/shared/constants/file-type";

import {
  useDefaultUploadFileValidation,
  type EFunnels,
  type EServiceType,
} from "@/entities/documents";

import { useConvert } from "../model/useConvert";
import { useMergeImagesToPdf } from "../model/useMergeImagesToPdf";

interface Props extends PropsWithChildren {
  serviceType: EServiceType;
  funnel: EFunnels;
  formatTo?: InternalFileType;
  acceptedFormats: InternalFileType[];
  multiple?: boolean;
}

export const ConvertUploadWrapper: FC<Props> = ({
  serviceType,
  funnel,
  formatTo = InternalFileType.PDF,
  acceptedFormats,
  multiple = false,
  children,
}) => {
  const convertFile = useConvert({ serviceType, funnel, formatTo });
  const { validate, error, setError } = useDefaultUploadFileValidation({
    acceptedFormats,
    funnel,
    multiple,
  });
  const mergeImagesToPdf = useMergeImagesToPdf({ setError });

  const isImageToPdfFunnel = isImageToPdfConvertFunnel(
    formatTo,
    acceptedFormats
  );

  const onFileUpload = useCallback(
    async (files: FileList) => {
      // Snapshot the FileList synchronously. The caller resets `input.value`
      // immediately after invoking this handler, which clears the live
      // FileList reference — by the time any `await` resolves below, `files`
      // would be empty and `files[0]` would be undefined.
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      const isValid = await validate(files);
      if (!isValid) return;

      if (multiple && isImageToPdfFunnel && fileArray.length > 1) {
        await mergeImagesToPdf(fileArray);

        return;
      }

      const file = fileArray[0];
      if (!file) return;

      convertFile(file);
    },
    [convertFile, isImageToPdfFunnel, mergeImagesToPdf, multiple, validate]
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
