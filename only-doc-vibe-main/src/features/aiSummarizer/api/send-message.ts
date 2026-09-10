import { apiHttpClient } from "@/shared/api/api-http-client";
import { API_ROUTES } from "@/shared/api/api-routes";

import type { SendMessageResult } from "./types";

export const sendMessage = async (
  chatId: string,
  question: string
): Promise<SendMessageResult> => {
  const response = await apiHttpClient.post<SendMessageResult>(
    API_ROUTES.AI_SUMMARIZER_MESSAGES(chatId),
    { question }
  );

  return response.data;
};
