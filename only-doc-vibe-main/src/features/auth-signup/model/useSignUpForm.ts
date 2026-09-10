import { useState, type FormEvent } from "react";
import { isAxiosError } from "axios";

import type { components } from "@/shared/api/cms/cms-schema";
import { EAnalyticsEvents, trackEvent } from "@/shared/lib/analytics";

import { signUp } from "../api/services";
import { localizeSignUpApiError } from "./localize-sign-up-error";

type SignUpData = components["schemas"]["SignUp"];

type SignUpStep = "sign-up" | "success";

export interface IUseSignUpFormProps {
  email: string;
  password: string;
  emailError: string | null;
  passwordError: string | null;
  isLoading: boolean;
  currentStep: SignUpStep;
  signUpError: string | null;

  setEmail: (email: string) => void;
  setPassword: (value: string, isValid: boolean) => void;
  onEmailError: (error: string | null) => void;
  onPasswordError: (error: string | null) => void;
  onEmailBlur: (value: string) => void;
  onEmailFocus: () => void;
  onPasswordFocus: () => void;
  onLoginLinkClick: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  goToSuccess: () => void;
  goToSignUp: () => void;
}

interface IUseSignUpFormArgs {
  texts: SignUpData;
}

export const useSignUpForm = ({
  texts,
}: IUseSignUpFormArgs): IUseSignUpFormProps => {
  const [email, setEmailState] = useState("");
  const [password, setPasswordState] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<SignUpStep>("sign-up");

  const setEmail = (value: string): void => {
    setEmailState(value);
    setEmailError(null);
    setSignUpError(null);
  };

  const setPassword = (value: string, isValid: boolean): void => {
    setPasswordState(value);
    setIsPasswordValid(isValid);
    setSignUpError(null);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    setSignUpError(null);

    if (!email.trim()) {
      setEmailError(texts.form.input_email_errors.email_empty);

      return;
    }

    if (!password) {
      setPasswordError(texts.form.input_password_errors.password_empty);

      return;
    }

    if (!isPasswordValid) {
      return;
    }

    setIsLoading(true);
    trackEvent(EAnalyticsEvents.SIGN_UP_CONFIRM_TAP);

    try {
      await signUp({
        email: email.trim(),
        password,
      });

      goToSuccess();
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const errorCode = error.response?.data?.errorCode;

        if (status === 400) {
          if (errorCode === "AUTH_EMAIL_ALREADY_USED") {
            setEmailError(texts.sign_up_errors.email_already_used);
          } else if (errorCode === "AUTH_EMAIL_INVALID_EMAIL") {
            setEmailError(texts.form.input_email_errors.validation_error);
          } else if (errorCode === "AUTH_PASSWORD_POLICY_FAILED") {
            setPasswordError(
              texts.form.input_password_errors.password_too_short_error
            );
          } else if (errorCode === "AUTH_USER_ALREADY_REGISTERED") {
            setEmailError(texts.sign_up_errors.user_already_registered);
          } else {
            setSignUpError(
              localizeSignUpApiError(
                errorCode,
                texts.sign_up_errors,
                texts.general_errors
              )
            );
          }
        } else if (status === 403) {
          setSignUpError(
            localizeSignUpApiError(
              errorCode,
              texts.sign_up_errors,
              texts.general_errors
            )
          );
        } else if (status === 409) {
          setEmailError(texts.sign_up_errors.user_already_registered);
        } else {
          setSignUpError(texts.general_errors.unexpected_error);
        }
      } else {
        setSignUpError(texts.general_errors.network_error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const goToSignUp = (): void => {
    setCurrentStep("sign-up");
    setSignUpError(null);
  };

  const goToSuccess = (): void => {
    setCurrentStep("success");
  };

  const onEmailError = (error: string | null): void => {
    setEmailError(error);
  };

  const onPasswordError = (error: string | null): void => {
    if (error) {
      trackEvent(EAnalyticsEvents.EMAIL_ENTER_ERROR, {
        email,
        error,
        from_page: "sign_up",
        action: "blur",
      });
    }

    setPasswordError(error);
  };

  const onEmailBlur = (value: string): void => {
    if (!value) return;

    trackEvent(EAnalyticsEvents.EMAIL_VALIDATION, {
      email: value,
      show_in: "sign_up",
      from_page: "sign_up",
    });

    if (emailError) {
      trackEvent(EAnalyticsEvents.EMAIL_ENTER_ERROR, {
        email: value,
        error: emailError,
        from_page: "sign_up",
        action: "blur",
      });
    }
  };

  const onEmailFocus = (): void =>
    trackEvent(EAnalyticsEvents.EMAIL_ENTER_TAP, { type: "email" });

  const onPasswordFocus = (): void =>
    trackEvent(EAnalyticsEvents.EMAIL_ENTER_TAP, { type: "password" });

  const onLoginLinkClick = (): void => trackEvent(EAnalyticsEvents.LOG_IN_TAP);

  return {
    email,
    password,
    emailError,
    passwordError,
    isLoading,
    currentStep,
    signUpError,

    setEmail,
    setPassword,
    onEmailError,
    onPasswordError,
    onEmailBlur,
    onEmailFocus,
    onPasswordFocus,
    onLoginLinkClick,
    onSubmit,
    goToSignUp,
    goToSuccess,
  };
};
