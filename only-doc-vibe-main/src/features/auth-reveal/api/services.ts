import { apiHttpClient } from "@/shared/api/api-http-client";
import { API_ROUTES } from "@/shared/api/api-routes";

interface RevealRequest {
  readonly email: string;
  readonly last_uploaded_filename?: string;
  readonly last_uploaded_file_size?: number;
  readonly funnel?: string;
}

const ensureAnonymousSession = async (): Promise<void> => {
  try {
    await apiHttpClient.get(API_ROUTES.USER_ME);
  } catch {
    await apiHttpClient.post(API_ROUTES.AUTH_ANONYMOUS_SESSION, {});
  }
};

export const revealUser = async (data: RevealRequest): Promise<void> => {
  await ensureAnonymousSession();

  await apiHttpClient.patch(API_ROUTES.USER_REVEAL, {
    email: data.email,
    ...(data.last_uploaded_filename && {
      last_uploaded_filename: data.last_uploaded_filename,
    }),
    ...(data.last_uploaded_file_size && {
      last_uploaded_file_size: data.last_uploaded_file_size,
    }),
    ...(data.funnel && {
      funnel: data.funnel,
    }),
  });
};
