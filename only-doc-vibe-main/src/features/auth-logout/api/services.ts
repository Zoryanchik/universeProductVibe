import { apiHttpClient } from "@/shared/api/api-http-client";
import { API_ROUTES } from "@/shared/api/api-routes";

export const logout = async (): Promise<void> => {
  await apiHttpClient.post(API_ROUTES.AUTH_LOGOUT, {});
};

export const createAnonymousSession = async (): Promise<void> => {
  await apiHttpClient.post(API_ROUTES.AUTH_ANONYMOUS_SESSION, {});
};
