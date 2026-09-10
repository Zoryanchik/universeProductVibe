import { type FC } from "react";
import { Button } from "@universe-forma/ui-pes";
import { ReactComponent as ChevronLeftIcon } from "@public/assets/icons/chevron-left-icon.svg?react";

import type { components } from "@/shared/api/cms/cms-schema";
import { EmailInput } from "@/shared/ui/email-input";
import { CheckYourInboxStep } from "@/shared/ui/check-your-inbox-step";
import { BaseFormContainer } from "@/shared/ui/base-form-container";
import { Title } from "@/shared/ui/title";

import { useLoginForm } from "../model/useLoginForm";

type LogInData = components["schemas"]["LogIn"];

interface IProps {
  readonly goToLogin: () => void;
  readonly texts: LogInData;
}

export const ForgotPasswordForm: FC<IProps> = ({ goToLogin, texts }) => {
  const {
    email,
    emailError,
    currentStep,
    isLoading,
    setEmail,
    setEmailError,
    onSubmitResetPassword: onSubmit,
  } = useLoginForm({ texts });

  if (currentStep === "emailSent")
    return (
      <CheckYourInboxStep
        email={email}
        texts={{
          title: texts.check_inbox.title,
          subtitle: texts.check_inbox.subtitle,
          backButtonText: texts.check_inbox.back_button,
        }}
      />
    );

  return (
    <form className="flex w-[528px] min-w-[343px]" onSubmit={onSubmit}>
      <BaseFormContainer>
        <div className="flex cursor-pointer items-start self-stretch">
          <button
            type="button"
            onClick={() => goToLogin()}
            aria-label={texts.forgot_password.back_button}
          >
            <div className="flex items-center justify-center gap-2 py-3">
              <ChevronLeftIcon className="rtl:rotate-180" />
              <span className="text-text-primary font-medium">
                {texts.forgot_password.back_button}
              </span>
            </div>
          </button>
        </div>
        <div className="flex flex-col items-center gap-1 self-stretch py-3">
          <Title level="h1" variant="desktop-title-4" align="center">
            {texts.forgot_password.title}
          </Title>
          <div className="text-text-primary text-body-2 text-center">
            <span className="font-semibold">
              {texts.forgot_password.subtitle_highlighted_part}
            </span>
            <span> {texts.forgot_password.subtitle_rest}</span>
          </div>
        </div>
        <div className="self-stretch pb-5">
          <EmailInput
            placeholder={texts.form.email_placeholder}
            error={emailError}
            setError={setEmailError}
            value={email}
            onChange={setEmail}
            validationErrors={texts.form.input_email_errors}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          variant="filled"
          color="primary"
          className="flex items-center justify-center gap-2 self-stretch rounded-2xl px-6 py-4"
          disabled={isLoading || !!emailError}
        >
          {texts.forgot_password.submit_button}
        </Button>
      </BaseFormContainer>
    </form>
  );
};
