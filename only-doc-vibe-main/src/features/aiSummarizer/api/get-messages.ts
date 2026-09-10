import { apiHttpClient } from "@/shared/api/api-http-client";
import { API_ROUTES } from "@/shared/api/api-routes";

import type { MessageItem } from "./types";

export const getMessages = async (chatId: string): Promise<MessageItem[]> => {
  const response = await apiHttpClient.get<MessageItem[]>(
    API_ROUTES.AI_SUMMARIZER_MESSAGES(chatId)
  );

  return response.data;
};
