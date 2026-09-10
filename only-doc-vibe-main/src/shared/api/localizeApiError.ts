import type { TFunction } from "../lib/translations/types";

const mapErrorCode = (errorCode: string, t: TFunction): string | null => {
  switch (errorCode) {
    case "AUTH_INVALID_CREDENTIALS":
      return String(t("api_errors.error.login.wrong-credentials"));
    case "AUTH_EMAIL_ALREADY_USED":
      return String(t("api_errors.error.email.already-used"));
    case "AUTH_EMAIL_INVALID_EMAIL":
      return String(t("api_errors.error.email.invalid"));
    case "AUTH_USER_ALREADY_REGISTERED":
      return String(t("api_errors.error.user.already-registered"));
    case "AUTH_USER_NOT_FOUND":
      return String(t("api_errors.error.user.not-found"));
    case "AUTH_ACCOUNT_BLOCKED":
      return String(t("api_errors.error.account.blocked"));
    case "AUTH_ACCOUNT_DELETION_IN_PROGRESS":
      return String(t("api_errors.error.account.deletion-in-progress"));
    case "AUTH_EMAIL_TOKEN_INVALID":
      return String(t("api_errors.error.email.token-invalid"));
    case "AUTH_EMAIL_TOKEN_EXPIRED":
      return String(t("api_errors.error.email.token-expired"));
    case "AUTH_PASSWORD_MISMATCH":
      return String(t("api_errors.error.password.dont-match"));
    case "AUTH_WRONG_PASSWORD":
      return String(t("api_errors.error.password.wrong-current"));
    case "AUTH_PASSWORD_POLICY_FAILED":
      return String(t("api_errors.error.password.min-length"));
    default:
      return null;
  }
};

export const localizeApiError = (
  message: string | undefined,
  t: TFunction,
  errorCode?: string
) => {
  if (errorCode) {
    const mapped = mapErrorCode(errorCode, t);
    if (mapped) {
      return mapped;
    }
  }

  switch (message) {
    // Login errors
    case "error.login.wrong-credentials":
    case "Invalid email or password":
      return String(t("api_errors.error.login.wrong-credentials"));

    // Password errors
    case "error.password.min-length":
    case "Password must be at least 8 characters long":
      return String(t("api_errors.error.password.min-length"));
    case "error.password.max-length":
    case "Password must be shorter than 50 characters":
      return String(t("api_errors.error.password.max-length"));
    case "error.password.dont-match":
    case "Passwords do not match":
      return String(t("api_errors.error.password.dont-match"));

    // Email errors
    case "error.email.already-used":
    case "Email already used":
      return String(t("api_errors.error.email.already-used"));
    case "error.email.invalid":
    case "Invalid email format":
      return String(t("api_errors.error.email.invalid"));
    case "error.email.used-by-another-user":
      return String(t("api_errors.error.email.already-used"));
    case "error.email.token-invalid":
      return String(t("api_errors.error.email.token-invalid"));
    case "error.email.token-expired":
      return String(t("api_errors.error.email.token-expired"));

    // User errors
    case "error.user.already-revealed":
    case "User already registered":
      return String(t("api_errors.error.user.already-registered"));
    case "error.user.not-found":
    case "User not found":
      return String(t("api_errors.error.user.not-found"));

    // Account status errors
    case "Account is blocked":
      return String(t("api_errors.error.account.blocked"));
    case "Account deletion is in progress":
      return String(t("api_errors.error.account.deletion-in-progress"));

    // File errors
    case "error.file.wrong-format":
      return String(t("api_errors.error.file.wrong_format"));
    case "error.file.max-size":
      return String(t("api_errors.error.file.max-size"));
    case "error.file.deleted":
      return String(t("api_errors.error.file.deleted"));

    // Other errors
    case "error.change-password.wrong-current-password":
    case "Current password is incorrect":
      return String(t("api_errors.error.password.wrong-current"));
    case "error.payment.required":
      return String(t("api_errors.error.payment.required"));

    default:
      return String(t("api_errors.unknown"));
  }
};
