import { type FC } from "react";
import { Button, cn } from "@universe-forma/ui-pes";
import { ReactComponent as AlertIcon } from "@public/assets/icons/alert.svg?react";

import type { components } from "@/shared/api/cms/cms-schema";
import { Link } from "@/shared/ui/Link";
import { PAGE_LINKS } from "@/shared/constants/page-links";
import { EmailInput } from "@/shared/ui/email-input";
import { PasswordInput } from "@/shared/ui/password-input";
import { BaseFormContainer } from "@/shared/ui/base-form-container";
import { CheckYourInboxStep } from "@/shared/ui/check-your-inbox-step";

import { useSignUpForm } from "../model/useSignUpForm";
import { resolveConsentText } from "../lib/resolve-consent-text";
import { resolveEmailTemplate } from "../lib/resolve-email-template";

type SignUpData = components["schemas"]["SignUp"];

interface IProps {
  readonly texts: SignUpData;
  readonly loginHref?: string;
}

export const SignUpForm: FC<IProps> = ({
  texts,
  loginHref = PAGE_LINKS.LOGIN,
}) => {
  const {
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
  } = useSignUpForm({ texts });

  if (currentStep === "success") {
    return (
      <CheckYourInboxStep
        email={email}
        texts={{
          title: texts.check_inbox.title,
          subtitle: [
            resolveEmailTemplate(texts.check_inbox.subtitle, email),
            texts.check_inbox.subtitle_additional,
          ],
          backButtonText: texts.check_inbox.back_button,
        }}
        handleClickBack={goToSignUp}
        showGmailButton={false}
      />
    );
  }

  const isFormValid =
    email.trim().length > 0 &&
    password.length >= 8 &&
    !emailError &&
    !passwordError;

  return (
    <form
      className="flex w-full max-w-[528px] min-w-[343px]"
      onSubmit={onSubmit}
    >
      <BaseFormContainer>
        {/* Header */}
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

        {/* General error message */}
        {signUpError && (
          <div className="flex max-w-[920px] min-w-[300px] items-start gap-4 self-stretch rounded-2xl bg-[#FCD2CF] p-4 backdrop-blur-[50px]">
            <div className="flex items-center justify-center">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#FABBB7] p-2">
                <AlertIcon fill={"var(--color-error-dark)"} />
              </div>
            </div>
            <div className="text-body text-secondary-filled-500 flex min-h-10 flex-1 flex-col items-start justify-center">
              {signUpError}
            </div>
          </div>
        )}

        {/* Form inputs */}
        <div className="flex flex-col items-start gap-4 self-stretch pb-5">
          <EmailInput
            placeholder={texts.form.email_placeholder}
            error={emailError}
            setError={onEmailError}
            value={email}
            onChange={setEmail}
            onBlur={onEmailBlur}
            validationErrors={texts.form.input_email_errors}
            onFocus={onEmailFocus}
          />
          <PasswordInput
            placeholder={texts.form.password_placeholder}
            error={passwordError}
            setError={onPasswordError}
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            validationErrors={texts.form.input_password_errors}
            onFocus={onPasswordFocus}
          />
        </div>

        {/* Submit button and links */}
        <div className="flex w-full flex-col gap-2">
          <Button
            type="submit"
            size="lg"
            variant="filled"
            color="primary"
            className="flex items-center justify-center gap-2 self-stretch rounded-2xl px-6 py-4"
            disabled={isLoading || !isFormValid}
            data-testid="login-button"
          >
            {texts.submit_button}
          </Button>

          {/* Login link */}
          <div className="flex items-start justify-center gap-2 self-stretch pt-6">
            <p className="text-body">{texts.have_account}</p>
            <Link
              href={loginHref}
              className="text-body font-normal"
              onClick={onLoginLinkClick}
            >
              {texts.login_cta}
            </Link>
          </div>

          {/* Terms and Privacy */}
          <p className="text-caption self-stretch pt-6 text-center leading-loose">
            {resolveConsentText(
              texts.consent_text,
              texts.consent_terms_label,
              texts.consent_privacy_label
            )}
          </p>
        </div>
      </BaseFormContainer>
    </form>
  );
};
