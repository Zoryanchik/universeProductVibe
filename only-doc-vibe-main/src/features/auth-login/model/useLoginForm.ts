import { useState, type FormEvent } from "react";
import { isAxiosError } from "axios";

import type { components } from "@/shared/api/cms/cms-schema";
import { EAnalyticsEvents, trackEvent } from "@/shared/lib/analytics";
import { localeNavigate } from "@/shared/lib/navigation/localeNavigate";
import { PAGE_LINKS } from "@/shared/constants/page-links";

import { fetchCurrentUser, setUser } from "@/entities/user";

import { login, sendRecoverPasswordRequest } from "../api/services";
import { localizeLoginApiError } from "./localize-login-error";

type LogInData = components["schemas"]["LogIn"];

type LoginStep = "login" | "emailSent" | "forgotPassword";

export interface IUseLoginFormProps {
  email: string;
  password: string;
  rememberMe: boolean;
  emailError: string | null;
  passwordError: string | null;
  loginError: string | null;
  isLoading: boolean;
  currentStep: LoginStep;

  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setRememberMe: (value: boolean) => void;
  setEmailError: (error: string | null) => void;
  setPasswordError: (error: string | null) => void;
  onSubmitLogin: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  onSubmitResetPassword: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  goToForgotPassword: () => void;
  goToLogin: () => void;
  goToEmailSent: () => void;
}

interface IUseLoginFormArgs {
  texts: LogInData;
}

export const useLoginForm = ({
  texts,
}: IUseLoginFormArgs): IUseLoginFormProps => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<LoginStep>("login");

  const onSubmitLogin = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!email?.length || !password?.length) {
      if (!email?.length)
        setEmailError(texts.form.input_email_errors.email_empty);

      if (!password?.length)
        setPasswordError(texts.form.input_password_errors.password_empty);

      return;
    }

    if (emailError || passwordError) return;

    setIsLoading(true);
    setLoginError(null);

    try {
      await login({ email: email.trim(), password, rememberMe });

      const user = await fetchCurrentUser();
      setUser(user);
      localeNavigate(PAGE_LINKS.HOME);
    } catch (error) {
      if (isAxiosError(error)) {
        const errorCode = error.response?.data?.errorCode;
        setLoginError(
          localizeLoginApiError(
            errorCode,
            texts.log_in_errors,
            texts.general_errors
          )
        );

        return;
      }

      setLoginError(texts.general_errors.network_error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitResetPassword = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!email.length) {
      setEmailError(texts.form.input_email_errors.email_empty);

      return;
    }

    if (emailError) return;

    setIsLoading(true);
    trackEvent(EAnalyticsEvents.RECOVER_PASS_CONFIRM_TAP);

    try {
      await sendRecoverPasswordRequest(email.trim());

      goToEmailSent();
    } catch (error) {
      if (isAxiosError(error)) {
        const errorCode = error.response?.data?.errorCode;
        setEmailError(
          localizeLoginApiError(
            errorCode,
            texts.log_in_errors,
            texts.general_errors
          )
        );

        return;
      }

      setEmailError(texts.general_errors.network_error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToForgotPassword = (): void => {
    trackEvent(EAnalyticsEvents.FORGOT_PASSWORD_TAP);
    trackEvent(EAnalyticsEvents.RECOVER_PASS_MODAL_VIEW);
    setCurrentStep("forgotPassword");
  };

  const goToLogin = (): void => {
    setCurrentStep("login");
  };

  const goToEmailSent = (): void => {
    setCurrentStep("emailSent");
  };

  return {
    email,
    password,
    rememberMe,
    emailError,
    passwordError,
    loginError,
    isLoading,
    currentStep,

    setEmail,
    setPassword,
    setRememberMe,
    setEmailError,
    setPasswordError,
    onSubmitLogin,
    onSubmitResetPassword,
    goToForgotPassword,
    goToLogin,
    goToEmailSent,
  };
};
