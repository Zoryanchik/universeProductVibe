import { type FC } from "react";
import { ReactComponent as RightChevron } from "@public/assets/contact-us/right.svg?react";
import { Button, cn } from "@universe-forma/ui-pes";

import type { IContactUsFormContent } from "../model/types";
import { useContactUs } from "../model/useContactUs";

export interface ContactUsFormProps {
  readonly content: IContactUsFormContent;
}

export const ContactUsForm: FC<ContactUsFormProps> = ({ content }) => {
  const {
    formTitle,
    namePlaceholder,
    emailPlaceholder,
    messagePlaceholder,
    submitButtonText,
    requiredFieldText,
  } = content;

  const {
    email,
    emailError,
    emailValid,
    name,
    message,
    messageError,
    isLoading,
    onEmailInput,
    onNameInput,
    onMessageInput,
    onSubmit,
    setEmailError,
    setMessageError,
  } = useContactUs(content);

  return (
    <form
      className={cn(
        "flex w-full flex-1 flex-col items-center gap-4 self-stretch rounded-[20px] bg-white p-6 shadow-[0_8px_12px_0_rgba(0,0,0,0.08),0_2px_6px_2px_rgba(0,0,0,0.04)]",
        "lg:max-w-[620px]"
      )}
      onSubmit={onSubmit}
    >
      <p className="text-subtitle-emph w-full text-[#020f20]">{formTitle}</p>

      <div className="flex w-full gap-4">
        <div className="flex flex-1 flex-col">
          <input
            id="name"
            type="text"
            className="text-text-primary flex h-14 min-h-14 w-full flex-1 flex-col items-center gap-2 rounded-2xl border border-black/15 bg-white px-3 py-[7px] outline-none focus:ring-0"
            placeholder={namePlaceholder}
            value={name}
            onChange={onNameInput}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <input
            id="email"
            type="text"
            className={cn(
              "text-text-primary flex h-14 min-h-14 w-full flex-1 flex-col items-center gap-2 rounded-2xl border border-black/15 bg-white px-3 py-[7px] outline-none focus:ring-0",
              {
                "bg-error-8 text-error-main": !!emailError?.length,
              }
            )}
            placeholder={emailPlaceholder}
            value={email}
            onChange={onEmailInput}
            onBlur={() =>
              !email.length ? setEmailError(requiredFieldText) : null
            }
            inputMode="email"
            autoComplete="email"
          />
          <span
            className={cn("text-caption text-error-main", {
              "hidden!": !emailError?.length,
            })}
          >
            {emailError}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-start gap-1 self-stretch">
        <textarea
          id="message"
          className={cn(
            "text-text-primary flex min-h-[152px] flex-1 resize-none flex-col items-start justify-center self-stretch rounded-2xl border border-black/15 bg-white px-3 pt-3 pb-[7px] outline-none focus:ring-0",
            {
              "bg-error-8 text-error-main": !!messageError?.length,
            }
          )}
          placeholder={messagePlaceholder}
          value={message}
          onChange={onMessageInput}
          onBlur={() =>
            !message.length ? setMessageError(requiredFieldText) : null
          }
        />
        <span
          className={cn("text-caption text-error-main", {
            "hidden!": !messageError?.length,
          })}
        >
          {messageError}
        </span>
      </div>

      <Button
        type="submit"
        variant="filled"
        size="lg"
        color="primary"
        className="w-full"
        disabled={
          isLoading ||
          !message.length ||
          !email.length ||
          !emailValid ||
          !!emailError?.length ||
          !!messageError?.length
        }
        loading={isLoading}
        rightIcon={<RightChevron className="size-[18px]" />}
      >
        {submitButtonText}
      </Button>
    </form>
  );
};
