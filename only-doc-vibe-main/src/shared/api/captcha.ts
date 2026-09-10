import { CAPTCHA_SITE_KEY } from "astro:env/client";

export enum ECaptchaAction {
  USER_TENTH_FILE = "USER_TENTH_FILE",
  REFRESH_UPLOAD_LINK = "REFRESH_UPLOAD_LINK",
  CONTACT_US_FORM = "CONTACT_US_FORM",
}

export const checkRecaptcha = (
  action: ECaptchaAction = ECaptchaAction.USER_TENTH_FILE
): Promise<string> => {
  return new Promise((resolve) => {
    try {
      window?.grecaptcha?.enterprise?.ready(async () => {
        const token = await window?.grecaptcha?.enterprise?.execute(
          CAPTCHA_SITE_KEY,
          {
            action,
          }
        );

        resolve(token);
      });
    } catch {
      resolve("");
    }
  });
};
