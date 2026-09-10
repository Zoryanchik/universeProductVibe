import { apiHttpClient } from "@/shared/api/api-http-client";
import { API_ROUTES } from "@/shared/api/api-routes";

interface ValidateRecoveryPasswordTokenResponse {
  status: boolean;
}

interface RecoverPasswordConfirmationPayload {
  password: string;
  repeatPassword: string;
  token: string;
}

export const validateRecoveryPasswordToken = async (
  token: string
): Promise<boolean> => {
  const response =
    await apiHttpClient.post<ValidateRecoveryPasswordTokenResponse>(
      API_ROUTES.AUTH_VALIDATE_RECOVERY_PASSWORD_TOKEN,
      { token }
    );

  return Boolean(response.data?.status);
};

export const recoverPasswordConfirmation = async (
  payload: RecoverPasswordConfirmationPayload
): Promise<void> => {
  await apiHttpClient.patch(
    API_ROUTES.AUTH_RECOVER_PASSWORD_CONFIRMATION,
    payload
  );
};
