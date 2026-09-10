import { CAPTCHA_LIMIT } from "astro:env/client";

import { getIsClient } from "@/shared/lib/utils/getIsClient";
import useEventCallback from "@/shared/lib/state/useEventCallback";

import { useUserStore } from "../state/user-store";

export const useGetShouldUseGrepatchaForUpload = () => {
  const user = useUserStore.use.user();

  return useEventCallback(
    () =>
      getIsClient() &&
      window?.grecaptcha?.enterprise &&
      user?.count_uploaded_files &&
      user?.count_uploaded_files >= CAPTCHA_LIMIT
  );
};
