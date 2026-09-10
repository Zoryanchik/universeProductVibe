import type { ChangeEvent, InputHTMLAttributes } from "react";
import React, { useState } from "react";
import invisibility from "@public/assets/icons/invisibility.svg?url";
import visibility from "@public/assets/icons/visibility.svg?url";
import { cn } from "@universe-forma/ui-pes";
import { string } from "zod";
import alert from "@public/assets/icons/alert.svg?url";

import { useTranslation } from "../../lib/translations/useTranslation";

export interface IPasswordValidationMessages {
  password_too_short_error: string;
  password_too_long_error: string;
}

interface IProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange: (value: string, valid: boolean) => void;
  value: string;
  placeholder?: string;
  error: string | null;
  setError: (error: string | null) => void;
  validationErrors?: IPasswordValidationMessages;
}

export interface PasswordInputResult {
  value: string;
  isValid: boolean;
}

export const PasswordInput: React.FC<IProps> = (props) => {
  const { t } = useTranslation();
  const {
    value,
    autoComplete = "current-password",
    onChange,
    placeholder = t("global.create_password"),
    error,
    setError,
    validationErrors,
    ...rest
  } = props;
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isValid = !error?.length || !value.trim().length;

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    const tooShortMsg = validationErrors
      ? validationErrors.password_too_short_error
      : t("input_password.password_too_short_error");
    const tooLongMsg = validationErrors
      ? validationErrors.password_too_long_error
      : t("input_password.password_too_long_error");

    const passwordSchema = string()
      .min(8, { message: tooShortMsg })
      .max(50, { message: tooLongMsg });

    const validationResult = passwordSchema.safeParse(newValue);

    const valid = validationResult.success;

    setError?.(
      valid || !newValue.length
        ? null
        : validationResult.error.issues[0]?.message
    );

    onChange(e.target.value, valid);
  };

  const iconPath = passwordVisible ? invisibility : visibility;

  return (
    <div className="flex flex-1 flex-col items-start self-stretch">
      <div className="relative w-full">
        <input
          id="password"
          className={cn(
            "placeholder:text-text-disabled bg-os-filled-input-bg text-text-primary min-h-14 w-full rounded-xl px-3 py-4 pe-11 text-[16px] leading-6 font-light focus:outline-none",
            {
              "bg-error-8 text-error-main pe-22": !isValid,
            }
          )}
          type={passwordVisible ? "text" : "password"}
          inputMode="text"
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={onPasswordChange}
          data-testid="password-input"
          {...rest}
        />
        <div className="absolute end-3 top-1/2 flex -translate-y-1/2 items-center justify-center gap-2">
          <img
            className="cursor-pointer select-none"
            src={iconPath}
            alt="Toggle password visibility"
            onClick={togglePasswordVisibility}
            draggable={false}
            aria-hidden
          />
          {!isValid && (
            <img
              src={alert}
              alt="Invalid password"
              draggable={false}
              aria-hidden
            />
          )}
        </div>
      </div>
      {(error || !isValid) && (
        <p
          className={cn(
            "text-caption flex items-center justify-start gap-0.5 self-stretch px-3 pt-1 pb-0.5 font-sans",
            {
              "text-error-main": !isValid,
            }
          )}
        >
          {error}
        </p>
      )}
    </div>
  );
};
