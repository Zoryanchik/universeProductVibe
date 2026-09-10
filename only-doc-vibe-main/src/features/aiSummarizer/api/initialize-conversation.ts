import { apiHttpClient } from "@/shared/api/api-http-client";
import { API_ROUTES } from "@/shared/api/api-routes";

import type {
  InitializeConversationPayload,
  InitializeConversationResult,
} from "./types";

export const initializeConversation = async (
  payload: InitializeConversationPayload
): Promise<InitializeConversationResult> => {
  const response = await apiHttpClient.post<InitializeConversationResult>(
    API_ROUTES.AI_SUMMARIZER_INITIALIZE,
    payload
  );

  return response.data;
};
