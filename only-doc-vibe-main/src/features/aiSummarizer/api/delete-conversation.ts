import { apiHttpClient } from "@/shared/api/api-http-client";
import { API_ROUTES } from "@/shared/api/api-routes";

export const deleteConversation = async (chatId: string): Promise<void> => {
  await apiHttpClient.delete(API_ROUTES.AI_SUMMARIZER_CONVERSATION(chatId));
};
