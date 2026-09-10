import { useRef, useState, type FormEvent, type FormEventHandler } from "react";
import { isAxiosError } from "axios";

import { EAnalyticsEvents, trackEvent } from "@/shared/lib/analytics";
import { useTranslation } from "@/shared/lib/translations/useTranslation";
import { validateEmail } from "@/shared/lib/utils/validateEmail";

import { contactUs } from "../api/services";
import type { IContactUsFormContent } from "./types";

export interface IUseContactUsReturn {
  // State
  email: string;
  name: string;
  message: string;
  emailValid: boolean;
  emailError: string | null;
  nameError: string | null;
  messageError: string | null;
  isLoading: boolean;

  // Actions
  onEmailInput: FormEventHandler<HTMLInputElement>;
  onNameInput: FormEventHandler<HTMLInputElement>;
  onMessageInput: FormEventHandler<HTMLTextAreaElement>;
  setEmailError: (error: string | null) => void;
  setNameError: (error: string | null) => void;
  setMessageError: (error: string | null) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
}

export const useContactUs = ({
  requiredFieldText,
}: IContactUsFormContent): IUseContactUsReturn => {
  const { t } = useTranslation();
  // Form state
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  // Error state
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailValid, setEmailValid] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);

  const onEmailInput: FormEventHandler<HTMLInputElement> = (e): void => {
    if (emailError?.length) setEmailError(null);

    const newValue = e.currentTarget.value.trim();
    setEmail(newValue);

    const result = validateEmail({ t, email: newValue });

    setEmailValid(result.valid);
  };

  const onMessageInput: FormEventHandler<HTMLTextAreaElement> = (e): void => {
    if (messageError?.length) setMessageError(null);

    setMessage(e.currentTarget.value);
  };

  const onNameInput: FormEventHandler<HTMLInputElement> = (e): void => {
    setName(e.currentTarget.value);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!email?.length) {
      setEmailError(requiredFieldText);

      return;
    }

    if (!message?.length) {
      setMessageError(requiredFieldText);

      return;
    }

    if (emailError || messageError) return;

    if (isLoading || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsLoading(true);

    trackEvent(EAnalyticsEvents.FORM_SUBMIT, { button: "Send message" });

    try {
      await contactUs({ name, email, message });

      trackEvent(EAnalyticsEvents.FORM_SUBMISSION_STATUS, {
        status: "success",
      });

      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      trackEvent(EAnalyticsEvents.FORM_SUBMISSION_STATUS, { status: "error" });

      if (isAxiosError(error)) {
        // TODO: showToast("error msg")
      }
    } finally {
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  };

  return {
    // State
    email,
    name,
    message,
    emailError,
    emailValid,
    nameError,
    messageError,
    isLoading,

    // Actions
    onEmailInput,
    onNameInput,
    onMessageInput,
    setEmailError,
    setNameError,
    setMessageError,
    onSubmit,
  };
};
