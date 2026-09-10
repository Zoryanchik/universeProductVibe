import type { components } from "@/shared/api/cms/cms-schema";

type SignUpErrors = components["schemas"]["ErrorsSignUpErrorsComponent"];
type GeneralErrors = components["schemas"]["ErrorsGeneralErrorsComponent"];

export const localizeSignUpApiError = (
  errorCode: string | undefined,
  signUpErrors: SignUpErrors,
  generalErrors: GeneralErrors
): string => {
  switch (errorCode) {
    case "AUTH_EMAIL_ALREADY_USED":
      return signUpErrors.email_already_used;
    case "AUTH_USER_ALREADY_REGISTERED":
      return signUpErrors.user_already_registered;
    case "AUTH_ACCOUNT_BLOCKED":
      return signUpErrors.account_blocked;
    case "AUTH_ACCOUNT_DELETION_IN_PROGRESS":
      return signUpErrors.account_deletion_in_progress;
    default:
      return generalErrors.unexpected_error;
  }
};
