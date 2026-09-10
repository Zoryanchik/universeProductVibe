import { email as checkEmail, string, regexes } from "zod";

import type { TFunction } from "../translations/types";

type TValidateEmail = { valid: true } | { valid: false; message: string };

export interface IEmailValidationMessages {
  email_empty: string;
  max_length_error: string;
  invalid_character_error: string;
  latin_character_error: string;
  missing_symbol_error: string;
  validation_error: string;
}

type ValidateEmailArgs =
  | { t: TFunction; email: string; messages?: never }
  | { messages: IEmailValidationMessages; email: string; t?: never };

export const validateEmail = (args: ValidateEmailArgs): TValidateEmail => {
  const { email } = args;

  const msg = (key: keyof IEmailValidationMessages, tKey: string): string =>
    args.messages ? args.messages[key] : (args.t(tKey) as string);

  const customSchema = string()
    .trim()
    .min(1, { message: msg("email_empty", "input_email.email_empty") })
    .max(50, {
      message: msg("max_length_error", "input_email.max_length_error"),
    })
    .refine(
      (value) => {
        const invalidChars = new Set([
          "(",
          ")",
          "[",
          "]",
          "{",
          "}",
          "<",
          ">",
          "/",
          "\\",
          "|",
          ",",
          ";",
          ":",
          '"',
        ]);

        return !Array.from(value).some((ch) => invalidChars.has(ch));
      },
      {
        message: msg(
          "invalid_character_error",
          "input_email.invalid_character_error"
        ),
      }
    )
    .refine(
      (value) => Array.from(value).every((ch) => ch.charCodeAt(0) <= 127),
      {
        message: msg(
          "latin_character_error",
          "input_email.latin_character_error"
        ),
      }
    )
    .refine((value) => value.includes("@"), {
      message: msg("missing_symbol_error", "input_email.missing_symbol_error"),
    })
    .pipe(
      checkEmail({
        pattern: regexes.rfc5322Email,
        message: msg("validation_error", "input_email.validation_error"),
      })
    );

  const customResult = customSchema.safeParse(email);

  if (!customResult.success) {
    return { message: customResult.error?.issues[0]?.message, valid: false };
  }

  return { valid: true };
};
