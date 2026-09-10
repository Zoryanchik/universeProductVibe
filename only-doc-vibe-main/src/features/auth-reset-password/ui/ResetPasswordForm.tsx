import { type FC, type ReactNode } from "react";
import { navigate } from "astro:transitions/client";
import { Button, cn } from "@universe-forma/ui-pes";
import { ReactComponent as AlertIcon } from "@public/assets/icons/alert.svg?react";

import { useTranslation } from "@/shared/lib/translations/useTranslation";
import { BaseFormContainer } from "@/shared/ui/base-form-container";
import { PasswordInput } from "@/shared/ui/password-input";

import { useResetPasswordForm } from "../model/useResetPasswordForm";

interface IProps {
  readonly loginHref: string;
}

interface IFormHeadingProps {
  readonly title: string;
  readonly subtitle: string;
}

const FormHeading: FC<IFormHeadingProps> = ({ title, subtitle }) => (
  <div className="flex flex-col items-center gap-1 self-stretch py-3">
    <h1
      className={cn(
        "text-text-primary text-desktop-title-4 self-stretch text-center",
        "max-sm:text-mobile-title-4"
      )}
    >
      {title}
    </h1>
    <p className="text-text-primary text-body-2 text-center">{subtitle}</p>
  </div>
);

const FormCard: FC<{ readonly children: ReactNode }> = ({ children }) => (
  <div className="flex w-[528px] min-w-[343px]">
    <BaseFormContainer>{children}</BaseFormContainer>
  </div>
);

export const ResetPasswordForm: FC<IProps> = ({ loginHref }) => {
  const { t } = useTranslation();

  const {
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
  } = useResetPasswordForm();

  const goToLoginButton = (
    <Button
      type="button"
      size="lg"
      variant="filled"
      color="primary"
      className="flex items-center justify-center gap-2 self-stretch rounded-2xl px-6 py-4"
      onClick={() => void navigate(loginHref)}
    >
      {String(t("reset_password.go_to_login"))}
    </Button>
  );

  if (status === "success") {
    return (
      <FormCard>
        <FormHeading
          title={String(t("reset_password.success_title"))}
          subtitle={String(t("reset_password.success_subtitle"))}
        />
        {goToLoginButton}
      </FormCard>
    );
  }

  if (status === "validatingToken") {
    return (
      <FormCard>
        <FormHeading
          title={String(t("reset_password.validating_title"))}
          subtitle={String(t("reset_password.validating_subtitle"))}
        />
      </FormCard>
    );
  }

  if (status === "invalidToken") {
    return (
      <FormCard>
        <FormHeading
          title={String(t("reset_password.invalid_token_title"))}
          subtitle={String(t("reset_password.invalid_token_subtitle"))}
        />
        {goToLoginButton}
      </FormCard>
    );
  }

  return (
    <form className="flex w-[528px] min-w-[343px]" onSubmit={onSubmit}>
      <BaseFormContainer>
        <FormHeading
          title={String(t("reset_password.title"))}
          subtitle={String(t("reset_password.subtitle"))}
        />

        {formError && (
          <div className="flex max-w-[920px] min-w-[300px] items-start gap-4 self-stretch rounded-2xl bg-[#FCD2CF] p-4 backdrop-blur-[50px]">
            <div className="flex items-center justify-center">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#FABBB7] p-2">
                <AlertIcon fill={"var(--color-error-dark)"} />
              </div>
            </div>
            <div className="text-body text-text-primary flex min-h-10 flex-1 flex-col items-start justify-center">
              {formError}
            </div>
          </div>
        )}

        <div className="flex w-full flex-col gap-4 pb-5">
          <PasswordInput
            autoComplete="new-password"
            value={password}
            placeholder={String(t("reset_password.password_placeholder"))}
            error={passwordError}
            setError={setPasswordError}
            onChange={onPasswordChange}
          />
          <PasswordInput
            autoComplete="new-password"
            value={repeatPassword}
            placeholder={String(
              t("reset_password.repeat_password_placeholder")
            )}
            error={repeatPasswordError}
            setError={setRepeatPasswordError}
            onChange={onRepeatPasswordChange}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          variant="filled"
          color="primary"
          className="flex items-center justify-center gap-2 self-stretch rounded-2xl px-6 py-4"
          disabled={isSubmitDisabled}
        >
          {status === "submitting"
            ? String(t("global.loading"))
            : String(t("reset_password.submit_button"))}
        </Button>
      </BaseFormContainer>
    </form>
  );
};
