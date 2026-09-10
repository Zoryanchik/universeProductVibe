import { apiHttpClient } from "@/shared/api/api-http-client";
import { API_ROUTES } from "@/shared/api/api-routes";

export const contactUs = async ({
  email,
  name,
  message,
}: {
  email: string;
  name: string;
  message: string;
}) => {
  const response = await apiHttpClient.post(API_ROUTES.CONTACT_US, {
    email,
    name,
    message,
  });

  return response.data;
};
