import { type FC } from "react";
import { cn } from "@universe-forma/ui-pes";
import { ReactComponent as ChevronLeftIcon } from "@public/assets/icons/chevron-left-icon.svg?react";
import { ReactComponent as EmailSentImage } from "@public/assets/login/email-sent-image.svg?react";

import { useTranslation } from "../../lib/translations/useTranslation";
import { BaseFormContainer } from "../base-form-container";
import { Link } from "../Link/ui/Link";

interface IProps {
  email: string;
  texts: {
    title: string;
    subtitle: string | Record<string, unknown> | string[];
    backButtonText?: string;
    gmailButtonText?: string;
  };
  showGmailButton?: boolean;
  handleClickBack?: () => void;
}

export const CheckYourInboxStep: FC<IProps> = ({
  email,
  texts,
  showGmailButton,
  handleClickBack,
}) => {
  const { t } = useTranslation();

  const backLabel = texts.backButtonText || t("global.back");
  const gmailLabel = texts.gmailButtonText || t("check_inbox.open_with_gmail");

  return (
    <div className="flex w-[528px] min-w-[343px]">
      <BaseFormContainer>
        {handleClickBack && (
          <div className="flex items-start self-stretch">
            <button
              type="button"
              onClick={handleClickBack}
              aria-label={backLabel}
            >
              <div className="flex cursor-pointer items-center justify-center gap-2 py-3">
                <ChevronLeftIcon className="rtl:rotate-180" />
                <span className="text-text-primary font-medium">
                  {backLabel}
                </span>
              </div>
            </button>
          </div>
        )}

        <div className="flex flex-col items-center justify-center gap-1 self-stretch py-3">
          <h1
            className={cn(
              "text-mobile-title-2 text-text-primary self-stretch text-center",
              "max-sm:text-mobile-title-4"
            )}
          >
            {texts.title}
          </h1>
          <div className="text-text-primary text-body-2 flex flex-col text-center">
            {Array.isArray(texts.subtitle) ? (
              <>
                {texts.subtitle.map((text) => (
                  <span>{text}</span>
                ))}
              </>
            ) : (
              <>
                <span>{String(texts.subtitle)}</span>
                <span className="font-semibold">{email}</span>
              </>
            )}
          </div>
        </div>
        <EmailSentImage className="my-7.5" />
        {showGmailButton && email.endsWith("gmail.com") && (
          <Link
            // TODO: add styles from button when logic will be activated
            href="https://mail.google.com/"
            external
          >
            {gmailLabel}
          </Link>
        )}
      </BaseFormContainer>
    </div>
  );
};
