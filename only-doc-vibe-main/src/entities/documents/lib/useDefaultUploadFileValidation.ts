import { useCallback, useState } from "react";

import type { InternalFileType } from "@/shared/constants/file-type";
import { MAX_IMAGE_TO_PDF_FILES } from "@/shared/constants/max-image-to-pdf-files";
import { useTranslation } from "@/shared/lib/translations/useTranslation";
import { validateMultipleFiles } from "@/shared/lib/documents/validateFIle";

import type { EFunnels } from "../model/constants/funnels";

interface IUseDefaultUploadFileValidationParams {
  acceptedFormats: InternalFileType[];
  validatePasswordProtected?: boolean;
  funnel: EFunnels;
  multiple?: boolean;
}

export const useDefaultUploadFileValidation = ({
  acceptedFormats,
  validatePasswordProtected = false,
  multiple = false,
}: IUseDefaultUploadFileValidationParams) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(
    async (files: FileList) => {
      const validationResult = await validateMultipleFiles({
        files,
        allowedFileTypes: acceptedFormats,
        t,
        maxFilesCount: multiple ? MAX_IMAGE_TO_PDF_FILES : 1,
        validatePasswordProtected,
      });

      if (!validationResult.valid) {
        setError(validationResult.error);

        return false;
      }

      return true;
    },
    [acceptedFormats, multiple, t, validatePasswordProtected]
  );

  return { error, validate, setError };
};
