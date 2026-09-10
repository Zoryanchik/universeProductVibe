import type { FormEventHandler } from "react";
import React from "react";
import { cn } from "@universe-forma/ui-pes";
import alert from "@public/assets/icons/alert.svg?url";

import {
  validateEmail,
  type IEmailValidationMessages,
} from "../../lib/utils/validateEmail";
import { useTranslation } from "../../lib/translations/useTranslation";

interface IProps {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  setError: (error: string | null) => void;
  autofocus?: boolean;
  placeholder?: string;
  validationErrors?: IEmailValidationMessages;
  onFocus?: () => void;
  onBlur?: (value: string) => void;
}
export const EmailInput: React.FC<IProps> = ({
  value,
  onChange,
  error,
  setError,
  autofocus = true,
  placeholder: propsPlaceholder,
  validationErrors,
  onFocus,
  onBlur,
}) => {
  const { t } = useTranslation();

  const onEmailInput: FormEventHandler<HTMLInputElement> = (e) => {
    const newValue = e.currentTarget.value.trim();
    onChange(newValue);

    const result = validationErrors
      ? validateEmail({ messages: validationErrors, email: newValue })
      : validateEmail({ t, email: newValue });

    setError(result.valid || !newValue.length ? null : result.message);
  };

  const isValid = !error || !value.trim().length;

  const placeholder = propsPlaceholder || t("global.email");

  return (
    <div className="flex flex-1 flex-col items-start self-stretch">
      <div className="relative w-full">
        <input
          id="email"
          data-testid="email-input"
          value={value}
          className={cn(
            "placeholder:text-text-disabled bg-os-filled-input-bg text-text-primary min-h-14 w-full rounded-xl px-3 py-4 pe-11 text-[16px] leading-6 font-light focus:outline-none",
            {
              "bg-error-8 text-error-main": !isValid,
            }
          )}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={placeholder}
          onChange={onEmailInput}
          onFocus={onFocus}
          onBlur={() => onBlur?.(value)}
          autoFocus={autofocus}
        />
        {!isValid && (
          <div className="absolute end-3 top-1/2 flex -translate-y-1/2 items-center justify-center select-none">
            <img
              src={alert}
              alt="Invalid email"
              aria-hidden
              draggable={false}
            />
          </div>
        )}
      </div>
      {!isValid && (
        <div className="text-caption text-error-main flex items-center justify-start gap-0.5 self-stretch px-3 pt-1 pb-0.5 font-sans">
          {error}
        </div>
      )}
    </div>
  );
};
