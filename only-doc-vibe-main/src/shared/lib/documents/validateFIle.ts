import { InternalFileType } from "../../constants/file-type";
import type { TFunction } from "../translations/types";
import { getFIleTypeFromFilename } from "./getFileTypeFromFilename";
import { getHasPdfUserPassword } from "./getHasPdfUserPassword";

interface ValidateSuccess {
  valid: true;
}

interface ValidateError {
  valid: false;
  error: string;
  code: string;
}

interface ValidateSelectedFileProps {
  file: File | null;
  allowedFileTypes: InternalFileType | InternalFileType[];
  t: TFunction;
  maxFileSize?: number;
  errors?: Partial<Record<EFileValidationErrorCode, string>>;
  validatePasswordProtected?: boolean;
}

interface ValidateMultipleFilesProps {
  files: File[] | FileList;
  allowedFileTypes: InternalFileType | InternalFileType[];
  t: TFunction;
  maxFileSize?: number;
  errors?: Partial<Record<EFileValidationErrorCode, string>>;
  maxFilesCount?: number;
  validatePasswordProtected?: boolean;
}

const DEFAULT_MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export enum EFileValidationErrorCode {
  FILE_MISSING = "file-missing",
  MAX_SIZE = "max-size",
  WRONG_FORMAT = "wrong-format",
  MAX_FILES_COUNT = "max-files-count",
  PASSWORD_PROTECTED = "password-protected",
}

const DEFAULT_ERRORS = (
  t: TFunction,
  { maxFilesCount }: { maxFilesCount?: number } = {}
): Record<EFileValidationErrorCode, string> => ({
  [EFileValidationErrorCode.FILE_MISSING]: String(
    t("api_errors.error.file.file-missing")
  ),
  [EFileValidationErrorCode.MAX_SIZE]: String(
    t("api_errors.error.file.max-size")
  ),
  [EFileValidationErrorCode.WRONG_FORMAT]: String(
    t("api_errors.error.file.wrong_format")
  ),
  [EFileValidationErrorCode.MAX_FILES_COUNT]: String(
    t("api_errors.error.file.max-files-count", {
      count: maxFilesCount || "",
    })
  ),
  [EFileValidationErrorCode.PASSWORD_PROTECTED]: String(
    t("notifications.file_is_password_protected")
  ),
});

export const validateFile = async ({
  file,
  allowedFileTypes,
  t,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  errors: paramsErrors,
  validatePasswordProtected = false,
}: ValidateSelectedFileProps): Promise<ValidateSuccess | ValidateError> => {
  const errors = { ...DEFAULT_ERRORS(t), ...paramsErrors };

  if (!file) {
    return {
      valid: false,
      error: "file missing",
      code: "file-missing",
    };
  }

  if (file.size > maxFileSize) {
    return {
      valid: false,
      error: errors[EFileValidationErrorCode.MAX_SIZE],
      code: EFileValidationErrorCode.MAX_SIZE,
    };
  }

  const types = Array.isArray(allowedFileTypes)
    ? allowedFileTypes
    : [allowedFileTypes];
  const fileType = getFIleTypeFromFilename(file.name);

  if (!fileType || !types.includes(fileType)) {
    return {
      valid: false,
      error: errors[EFileValidationErrorCode.WRONG_FORMAT],
      code: EFileValidationErrorCode.WRONG_FORMAT,
    };
  }

  if (fileType === InternalFileType.PDF && validatePasswordProtected) {
    const isPasswordProtected = await getHasPdfUserPassword(file);
    if (isPasswordProtected) {
      return {
        valid: false,
        error: errors[EFileValidationErrorCode.PASSWORD_PROTECTED],
        code: EFileValidationErrorCode.PASSWORD_PROTECTED,
      };
    }
  }

  return {
    valid: true,
  };
};

export const validateMultipleFiles = async ({
  files: paramsFiles,
  allowedFileTypes,
  t,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  errors: paramsErrors,
  maxFilesCount = 1,
  validatePasswordProtected = false,
}: ValidateMultipleFilesProps): Promise<ValidateSuccess | ValidateError> => {
  const files = Array.from(paramsFiles);

  const errors = { ...DEFAULT_ERRORS(t, { maxFilesCount }), ...paramsErrors };

  if (!files[0]) {
    return {
      valid: false,
      error: errors[EFileValidationErrorCode.FILE_MISSING],
      code: EFileValidationErrorCode.FILE_MISSING,
    };
  }

  if (files.length > maxFilesCount) {
    return {
      valid: false,
      error: errors[EFileValidationErrorCode.MAX_FILES_COUNT],
      code: EFileValidationErrorCode.MAX_FILES_COUNT,
    };
  }

  const validations = await Promise.all(
    files.map((file) =>
      validateFile({
        file,
        allowedFileTypes,
        t,
        maxFileSize,
        errors: paramsErrors,
        validatePasswordProtected,
      })
    )
  );

  const error = validations.find((validation) => !validation.valid);

  return error || { valid: true };
};
