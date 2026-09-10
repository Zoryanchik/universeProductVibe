import { useEffect, useMemo, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";

import { localizeApiError } from "@/shared/api/localizeApiError";
import { useTranslation } from "@/shared/lib/translations/useTranslation";

import {
  recoverPasswordConfirmation,
  validateRecoveryPasswordToken,
} from "../api/services";

type ResetPasswordStatus =
  | "validatingToken"
  | "invalidToken"
  | "ready"
  | "submitting"
  | "success";

interface IUseResetPasswordForm {
  readonly password: string;
  readonly repeatPassword: string;
  readonly passwordError: string | null;
  readonly repeatPasswordError: string | null;
  readonly formError: string | null;
  readonly status: ResetPasswordStatus;
  readonly isSubmitDisabled: boolean;
  readonly setPasswordError: (error: string | null) => void;
  readonly setRepeatPasswordError: (error: string | null) => void;
  readonly onPasswordChange: (value: string, valid: boolean) => void;
  readonly onRepeatPasswordChange: (value: string, valid: boolean) => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export const useResetPasswordForm = (): IUseResetPasswordForm => {
  const { t } = useTranslation();

  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<ResetPasswordStatus>("validatingToken");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [repeatPasswordError, setRepeatPasswordError] = useState<string | null>(
    null
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const parsedToken = new URLSearchParams(window.location.search)
      .get("token")
      ?.trim();

    if (!parsedToken) {
      setStatus("invalidToken");
      setFormError(String(t("reset_password.invalid_token_subtitle")));

      return;
    }

    setToken(parsedToken);

    const validateToken = async () => {
      try {
        const isValid = await validateRecoveryPasswordToken(parsedToken);
        if (cancelled) return;

        setStatus(isValid ? "ready" : "invalidToken");
        if (!isValid) {
          setFormError(String(t("reset_password.invalid_token_subtitle")));
        }
      } catch {
        if (cancelled) return;

        setStatus("invalidToken");
        setFormError(String(t("reset_password.invalid_token_subtitle")));
      }
    };

    void validateToken();

    return () => {
      cancelled = true;
    };
  }, [t]);

  const onPasswordChange = (value: string, valid: boolean): void => {
    setPassword(value);
    if (valid || !value.length) {
      setPasswordError(null);
    }
  };

  const onRepeatPasswordChange = (value: string, valid: boolean): void => {
    setRepeatPassword(value);
    if (valid || !value.length) {
      setRepeatPasswordError(null);
    }
  };

  const isSubmitDisabled = useMemo(() => {
    if (status !== "ready") return true;

    return (
      !password.length ||
      !repeatPassword.length ||
      !!passwordError ||
      !!repeatPasswordError
    );
  }, [password, passwordError, repeatPassword, repeatPasswordError, status]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (status !== "ready" || !token) {
      return;
    }

    if (!password.length || !repeatPassword.length) {
      if (!password.length) {
        setPasswordError(String(t("input_password.password_empty")));
      }

      if (!repeatPassword.length) {
        setRepeatPasswordError(String(t("input_password.password_empty")));
      }

      return;
    }

    if (password !== repeatPassword) {
      setRepeatPasswordError(String(t("api_errors.error.password.dont-match")));

      return;
    }

    setFormError(null);
    setStatus("submitting");

    try {
      await recoverPasswordConfirmation({
        password,
        repeatPassword,
        token,
      });
      setStatus("success");
    } catch (error) {
      if (isAxiosError(error)) {
        const errorCode = error.response?.data?.errorCode;
        setFormError(
          localizeApiError(error.response?.data?.message, t, errorCode)
        );

        if (
          errorCode === "AUTH_EMAIL_TOKEN_INVALID" ||
          errorCode === "AUTH_EMAIL_TOKEN_EXPIRED"
        ) {
          setStatus("invalidToken");

          return;
        }
      } else {
        setFormError(String(t("api_errors.network_error")));
      }

      setStatus("ready");
    }
  };

  return {
    password,
    repeatPassword,
    passwordError,
    repeatPasswordError,
    formError,
    status,
    isSubmitDisabled,
    setPasswordError,
    setRepeatPasswordError,
    onPasswordChange,
    onRepeatPasswordChange,
    onSubmit,
  };
};
