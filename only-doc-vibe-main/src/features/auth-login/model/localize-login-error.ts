import type { components } from "@/shared/api/cms/cms-schema";

type LogInErrors = components["schemas"]["ErrorsLogInErrorsComponent"];
type GeneralErrors = components["schemas"]["ErrorsGeneralErrorsComponent"];

export const localizeLoginApiError = (
  errorCode: string | undefined,
  loginErrors: LogInErrors,
  generalErrors: GeneralErrors
): string => {
  switch (errorCode) {
    case "AUTH_INVALID_CREDENTIALS":
      return loginErrors.wrong_credentials;
    case "AUTH_ACCOUNT_BLOCKED":
      return loginErrors.account_blocked;
    case "AUTH_ACCOUNT_DELETION_IN_PROGRESS":
      return loginErrors.account_deletion_in_progress;
    case "AUTH_USER_NOT_FOUND":
      return loginErrors.user_not_found;
    default:
      return generalErrors.unexpected_error;
  }
};
