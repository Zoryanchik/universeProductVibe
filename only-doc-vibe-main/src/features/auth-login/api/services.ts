import { apiHttpClient } from "@/shared/api/api-http-client";
import { API_ROUTES } from "@/shared/api/api-routes";

export const login = async ({
  email,
  password,
  rememberMe,
}: {
  email: string;
  password: string;
  rememberMe: boolean;
}) => {
  const response = await apiHttpClient.post(API_ROUTES.AUTH_LOGIN, {
    email,
    password,
    rememberMe,
  });

  return response.data;
};

export const sendRecoverPasswordRequest = async (email: string) => {
  return apiHttpClient.post(API_ROUTES.AUTH_RECOVER_PASSWORD, { email });
};
