import { apiHttpClient } from "@/shared/api/api-http-client";
import { API_ROUTES } from "@/shared/api/api-routes";

import { EUserStatus } from "../model/constants/user-status";
import type { IUser } from "../model/types";

interface UserMeResponse {
  id: string;
  status: EUserStatus;
  email: string | null;
  fullname?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  locale?: string | null;
  had_subscription?: boolean;
  count_uploaded_files?: number;
}

interface AnonymousSessionResponse {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

const getStatus = (status: string | null | undefined): EUserStatus => {
  if (status && Object.values(EUserStatus).includes(status as EUserStatus)) {
    return status as EUserStatus;
  }

  return EUserStatus.ANONYMOUS;
};

export const fetchCurrentUser = async (): Promise<IUser> => {
  const response = await apiHttpClient.get<UserMeResponse>(API_ROUTES.USER_ME);
  const data = response.data;

  return {
    id: data.id,
    status: getStatus(data.status),
    email: data.email ?? "",
    fullname: data.fullname ?? undefined,
    firstName: data.firstName ?? undefined,
    lastName: data.lastName ?? undefined,
    hadSubscription: data.had_subscription,
    count_uploaded_files: data.count_uploaded_files,
    subscription: null,
  };
};

/**
 * Create anonymous session and set JWT cookies.
 * This should be called when user is not authenticated.
 */
export const createAnonymousSession = async (): Promise<IUser> => {
  const response = await apiHttpClient.post<AnonymousSessionResponse>(
    API_ROUTES.AUTH_ANONYMOUS_SESSION,
    {}
  );

  return {
    id: response.data.userId,
    status: EUserStatus.ANONYMOUS,
    email: "",
    hadSubscription: false,
    count_uploaded_files: 0,
    subscription: null,
  };
};

/**
 * Try to get current user, if fails (401) - create anonymous session.
 * This ensures user always has a valid session.
 */
export const ensureUserSession = async (): Promise<IUser> => {
  try {
    return await fetchCurrentUser();
  } catch (error) {
    // If unauthorized, create anonymous session
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      (error as { response?: { status?: number } }).response?.status === 401
    ) {
      return await createAnonymousSession();
    }

    throw error;
  }
};
