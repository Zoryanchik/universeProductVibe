import { type FC } from "react";
import { Button, cn } from "@universe-forma/ui-pes";
import { ReactComponent as AlertIcon } from "@public/assets/icons/alert.svg?react";

import type { components } from "@/shared/api/cms/cms-schema";
import { EAnalyticsEvents, trackEvent } from "@/shared/lib/analytics";
import { Link } from "@/shared/ui/Link";
import { PAGE_LINKS } from "@/shared/constants/page-links";
import { EmailInput } from "@/shared/ui/email-input";
import { PasswordInput } from "@/shared/ui/password-input";
import { BaseFormContainer } from "@/shared/ui/base-form-container";

import { RememberCheckbox } from "./RememberCheckbox";
import { useLoginForm } from "../model/useLoginForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

type LogInData = components["schemas"]["LogIn"];

interface IProps {
  readonly texts: LogInData;
  readonly signUpHref?: string;
}

export const LoginForm: FC<IProps> = ({
  texts,
  signUpHref = PAGE_LINKS.SIGN_UP,
}) => {
  const {
    email,
    emailError,
    password,
    passwordError,
    currentStep,
    isLoading,
    loginError,
    setEmail,
    setEmailError,
    setPassword,
    setPasswordError,
    setRememberMe,
    goToLogin,
    goToForgotPassword,
    onSubmitLogin: onSubmit,
  } = useLoginForm({ texts });

  if (currentStep === "forgotPassword")
    return <ForgotPasswordForm goToLogin={goToLogin} texts={texts} />;

  return (
    <form
      className="relative flex w-[528px] min-w-[343px]"
      onSubmit={(e) => onSubmit(e)}
    >
      <BaseFormContainer>
        <div
          className={cn("flex flex-col items-center gap-1 self-stretch p-3")}
        >
          <h1
            className={cn(
              "text-desktop-title-4 self-stretch text-center",
              "max-sm:text-mobile-title-4"
            )}
          >
            {texts.title}
          </h1>
          <p className="text-body-2 text-center font-normal">
            {texts.subtitle}
          </p>
        </div>
        {loginError && ( // TODO: needs styling when new translations arrived
          <div className="flex max-w-[920px] min-w-[300px] items-start gap-4 self-stretch rounded-2xl bg-[#FCD2CF] p-4 backdrop-blur-[50px]">
            <div className="flex items-center justify-center">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#FABBB7] p-2">
                <AlertIcon fill={"var(--color-error-dark)"} />
              </div>
            </div>
            <div className="text-body text-text-primary flex min-h-10 flex-1 flex-col items-start justify-center">
              {loginError}
            </div>
          </div>
        )}
        <div className="flex w-full flex-col gap-4 pb-5">
          <EmailInput
            placeholder={texts.form.email_placeholder}
            value={email}
            error={emailError}
            onChange={setEmail}
            setError={setEmailError}
            validationErrors={texts.form.input_email_errors}
            onFocus={() =>
              trackEvent(EAnalyticsEvents.EMAIL_ENTER_TAP, { type: "email" })
            }
          />
          <PasswordInput
            placeholder={texts.form.password_placeholder}
            value={password}
            error={passwordError}
            onChange={setPassword}
            setError={setPasswordError}
            validationErrors={texts.form.input_password_errors}
            onFocus={() =>
              trackEvent(EAnalyticsEvents.EMAIL_ENTER_TAP, {
                type: "password",
              })
            }
          />
          <div className="flex min-h-10 items-center justify-between self-stretch px-2">
            <RememberCheckbox
              onChange={setRememberMe}
              text={texts.remember_me_label}
            />
            <Button
              type="button"
              onClick={() => goToForgotPassword()}
              className="text-body text-secondary-filled-500 font-medium"
              variant="text"
              color="action"
              size="md"
            >
              {texts.forgot_password_link}
            </Button>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2">
          <Button
            type="submit"
            size="lg"
            variant="filled"
            color="primary"
            className="flex items-center justify-center gap-2 self-stretch rounded-2xl px-6 py-4"
            data-testid="login-button"
            disabled={isLoading || !!emailError || !!passwordError}
          >
            {texts.submit_button}
          </Button>
          <div className="flex items-start justify-center gap-2 self-stretch pt-6 font-medium">
            <p className="text-body font-normal">{texts.no_account_text}</p>
            <Link
              href={signUpHref}
              className="text-body font-normal"
              onClick={() => trackEvent(EAnalyticsEvents.SIGN_UP_TAP)}
            >
              {texts.signup_cta}
            </Link>
          </div>
        </div>
      </BaseFormContainer>
    </form>
  );
};
