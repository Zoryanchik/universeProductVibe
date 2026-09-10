import { type FC } from "react";
import { Button } from "@universe-forma/ui-pes";

import { BaseModal } from "@/shared/ui/base-modal";
import { EModalsTypes } from "@/shared/constants/modals-keys";
import { useCurrentModalOptions } from "@/shared/lib/modals/modals-store";
import { useTranslation } from "@/shared/lib/translations/useTranslation";
import { EmailInput } from "@/shared/ui/email-input";

import { useRevealForm } from "../model/useRevealForm";
import type { IRevealEmailModalOptions } from "../model/types";

export const RevealEmailModal: FC = () => {
  const { t } = useTranslation();
  const options = useCurrentModalOptions<
    typeof EModalsTypes.REVEAL_EMAIL_MODAL
  >(EModalsTypes.REVEAL_EMAIL_MODAL);

  const {
    onSuccess,
    onClose,
    lastUploadedFilename,
    lastUploadedFileSize,
    funnel,
    keepOpenedOnSuccess = false,
    canClose = true,
  } = (options ?? {}) as IRevealEmailModalOptions;

  const { email, setEmail, error, setError, isLoading, handleSubmit } =
    useRevealForm({
      onSuccess,
      lastUploadedFilename,
      lastUploadedFileSize,
      funnel,
      keepOpenedOnSuccess,
    });

  const handleClose = (): void => {
    onClose?.();
  };

  return (
    <BaseModal
      modalType={EModalsTypes.REVEAL_EMAIL_MODAL}
      canClose={canClose}
      onClose={handleClose}
      data-testid="reveal-email-modal"
      closeTestId="reveal-email-modal-close"
      className="w-full max-w-[400px] px-6 pb-6"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Title */}
        <h2 className="text-mobile-title-4 text-text-primary text-center">
          {String(t("reveal_modal.title"))}
        </h2>

        {/* Subtitle */}
        <p className="text-body-2 text-center">
          {String(t("reveal_modal.subtitle"))}
        </p>

        {/* Email Input */}
        <div className="w-full" data-testid="reveal-email-input">
          <EmailInput
            placeholder={String(t("global.email"))}
            value={email}
            error={error}
            setError={setError}
            onChange={setEmail}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full"
          data-testid="reveal-email-submit"
        >
          {isLoading
            ? String(t("global.loading"))
            : String(t("reveal_modal.button"))}
        </Button>

        {/* Terms Text */}
        <p className="text-caption text-text-tertiary text-center text-xs">
          {String(t("reveal_modal.terms_text"))}
        </p>
      </div>
    </BaseModal>
  );
};
