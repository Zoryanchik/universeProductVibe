import { apiHttpClient } from "@/shared/api/api-http-client";
import { API_ROUTES } from "@/shared/api/api-routes";

import type { ConversationItem } from "./types";

export const getConversations = async (): Promise<ConversationItem[]> => {
  const response = await apiHttpClient.get<ConversationItem[]>(
    API_ROUTES.AI_SUMMARIZER_CONVERSATIONS
  );

  return response.data;
};
