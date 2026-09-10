import { useState, useCallback } from "react";
import type { AxiosError } from "axios";

import { useTranslation } from "@/shared/lib/translations/useTranslation";
import { closeModal } from "@/shared/lib/modals/modals-store";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import { localizeApiError } from "@/shared/api/localizeApiError";
import { validateEmail } from "@/shared/lib/utils/validateEmail";

import { revealUser } from "../api/services";

interface ApiErrorResponse {
  errorCode?: string;
  message?: string;
}

interface UseRevealFormProps {
  onSuccess?: () => void;
  lastUploadedFilename?: string;
  lastUploadedFileSize?: number;
  funnel?: string;
  keepOpenedOnSuccess?: boolean;
}

interface UseRevealFormReturn {
  email: string;
  setEmail: (email: string) => void;
  error: string | null;
  setError: (error: string | null) => void;
  isLoading: boolean;
  handleSubmit: () => Promise<void>;
  clearError: () => void;
}

export const useRevealForm = ({
  onSuccess,
  lastUploadedFilename,
  lastUploadedFileSize,
  funnel,
  keepOpenedOnSuccess = false,
}: UseRevealFormProps): UseRevealFormReturn => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleEmailChange = useCallback(
    (value: string) => {
      setEmail(value);
      if (error) {
        clearError();
      }
    },
    [error, clearError]
  );

  const validateEmailInput = useCallback((): boolean => {
    const result = validateEmail({ t, email });

    if (!result.valid) {
      setError(result.message);

      return false;
    }

    return true;
  }, [email, t]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!validateEmailInput()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await revealUser({
        email: email.toLowerCase().trim(),
        last_uploaded_filename: lastUploadedFilename,
        last_uploaded_file_size: lastUploadedFileSize,
        funnel,
      });

      // Success - call callback and close modal
      onSuccess?.();

      if (!keepOpenedOnSuccess) {
        closeModal(EModalsTypes.REVEAL_EMAIL_MODAL);
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const errorCode = axiosError.response?.data?.errorCode;
      const errorMessage = axiosError.response?.data?.message || "";

      // Handle specific error codes
      if (
        errorCode === "AUTH_EMAIL_ALREADY_USED" ||
        errorCode === "AUTH_USER_ALREADY_REGISTERED"
      ) {
        setError(String(t("reveal_modal.errors.email_already_used")));
      } else if (errorCode === "AUTH_EMAIL_INVALID_EMAIL") {
        setError(String(t("reveal_modal.errors.email_invalid")));
      } else {
        // Generic error handling using message
        const localizedError = localizeApiError(errorMessage, t, errorCode);
        setError(localizedError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    email,
    validateEmailInput,
    onSuccess,
    keepOpenedOnSuccess,
    lastUploadedFilename,
    lastUploadedFileSize,
    funnel,
    t,
  ]);

  return {
    email,
    setEmail: handleEmailChange,
    error,
    setError,
    isLoading,
    handleSubmit,
    clearError,
  };
};
