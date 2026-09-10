import { useEffect, useRef, useState, type FC } from "react";
import { Button, IconButton, Input } from "@universe-forma/ui-pes";
import { ReactComponent as ChevronLeftIcon } from "@public/assets/icons/chevron-left-icon.svg?react";

import { EModalsTypes } from "@/shared/constants/modals-keys";
import {
  closeModal,
  useCurrentModalOptions,
  updateCurrentModalOptions,
} from "@/shared/lib/modals/modals-store";
import { BaseModal } from "@/shared/ui/base-modal";
import {
  IncorrectPdfPasswordError,
  removePdfUserPassword,
} from "@/shared/lib/documents/removePdfUserPassword";
import useEventCallback from "@/shared/lib/state/useEventCallback";
import { useTranslation } from "@/shared/lib/translations";
import { logger } from "@/shared/lib/utils/logger";

import type { EFunnels, EServiceType } from "@/entities/documents";

import { useDownloadUnlocked } from "../../model/hooks/useDownloadUnlocked";
import { startBackendUnlockFallback } from "../../lib/startBackendUnlockFallback";
import { UnlockPdfAsset } from "./UnlockPdfAsset";
import { UnlockPdfProgress } from "./UnlockPdfProgress";

export interface IUnlockPdfModalOptions {
  file: File;
  funnel?: EFunnels;
  serviceType?: EServiceType;
  autoStartBackend?: boolean;
  requiresPassword?: boolean;
  onUnlocked?: (unlockedFile: File) => void | Promise<void>;
  isPasswordFormVisible?: boolean;
  password?: string;
  passwordError?: string | null;
  isSubmitting?: boolean;
}

export const UnlockPdfModal: FC = () => {
  const {
    file,
    funnel,
    serviceType,
    autoStartBackend = false,
    requiresPassword = false,
    onUnlocked,
    isPasswordFormVisible: isPasswordFormVisibleOption = false,
    password = "",
    passwordError = null,
    isSubmitting = false,
  } = useCurrentModalOptions(EModalsTypes.UNLOCK_PDF_MODAL);
  const { t } = useTranslation();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordFormVisible, setIsPasswordFormVisible] = useState(
    requiresPassword || isPasswordFormVisibleOption
  );
  const hasStartedBackendRef = useRef(false);

  const { startWaitingUnlock } = useDownloadUnlocked();

  // Sync local visibility with option changes so an external
  // `updateCurrentModalOptions({ requiresPassword: true })` can switch the
  // modal from "auto-unlocking" to the password form mid-flight.
  useEffect(() => {
    if (requiresPassword || isPasswordFormVisibleOption) {
      setIsPasswordFormVisible(true);
    }
  }, [requiresPassword, isPasswordFormVisibleOption]);

  const startBackendFallback = useEventCallback(async () => {
    if (hasStartedBackendRef.current || !funnel || !serviceType) {
      return;
    }

    hasStartedBackendRef.current = true;

    const fileId = await startBackendUnlockFallback({
      file,
      funnel,
      serviceType,
    });

    if (!fileId) {
      hasStartedBackendRef.current = false;
      updateCurrentModalOptions(EModalsTypes.UNLOCK_PDF_MODAL, (prev) => {
        if (prev.isSubmitting || prev.isPasswordFormVisible) {
          return prev;
        }

        return {
          ...prev,
          isPasswordFormVisible: true,
          passwordError: String(t("modals.unlock_pdf.errors.could_not_unlock")),
        };
      });

      return;
    }

    startWaitingUnlock(fileId);
  });

  useEffect(() => {
    if (autoStartBackend) {
      void startBackendFallback();
    }
  }, [autoStartBackend, startBackendFallback]);

  const handleClose = () => {
    closeModal(EModalsTypes.UNLOCK_PDF_MODAL);
  };

  const showPasswordForm = () => {
    setIsPasswordFormVisible(true);
    updateCurrentModalOptions(EModalsTypes.UNLOCK_PDF_MODAL, {
      isPasswordFormVisible: true,
      passwordError: null,
    });
  };

  const hidePasswordForm = () => {
    setIsPasswordFormVisible(false);
    updateCurrentModalOptions(EModalsTypes.UNLOCK_PDF_MODAL, {
      isPasswordFormVisible: false,
      password: "",
      passwordError: null,
      isSubmitting: false,
    });
  };

  const handlePasswordChange = (value: string) => {
    updateCurrentModalOptions(EModalsTypes.UNLOCK_PDF_MODAL, {
      password: value,
      passwordError: null,
    });
  };

  const handleSubmit = async () => {
    const trimmedPassword = password.trim();
    if (!trimmedPassword || !onUnlocked) {
      return;
    }

    updateCurrentModalOptions(EModalsTypes.UNLOCK_PDF_MODAL, {
      password: trimmedPassword,
      passwordError: null,
      isPasswordFormVisible: true,
      isSubmitting: true,
    });

    let unlockedFile: File;
    try {
      unlockedFile = await removePdfUserPassword({
        file,
        password: trimmedPassword,
      });
    } catch (error) {
      logger.error("Failed to decrypt PDF with provided password", error);
      const isWrongPassword = error instanceof IncorrectPdfPasswordError;
      updateCurrentModalOptions(EModalsTypes.UNLOCK_PDF_MODAL, {
        isSubmitting: false,
        passwordError: String(
          isWrongPassword
            ? t("modals.unlock_pdf.errors.incorrect_password")
            : t("modals.unlock_pdf.errors.decrypt_failed")
        ),
      });

      return;
    }

    await onUnlocked(unlockedFile);
  };

  return (
    <BaseModal
      modalType={EModalsTypes.UNLOCK_PDF_MODAL}
      canClose={false}
      rootClassName="max-md:items-end"
      className="w-full max-w-[724px] overflow-hidden rounded-[20px] p-1 max-md:mx-0 max-md:max-h-[100dvh] max-md:max-w-full max-md:rounded-b-none [&>div:first-child]:hidden"
      data-testid="unlock-pdf-modal"
    >
      <div className="relative flex flex-col">
        <IconButton
          className="absolute start-3 top-3 z-10 md:start-4 md:top-4"
          variant="filled-tonal"
          color="action"
          size="sm"
          onClick={handleClose}
          data-testid="unlock-pdf-close"
        >
          <ChevronLeftIcon className="rtl:rotate-180" />
        </IconButton>

        <UnlockPdfAsset />

        <div className="flex flex-col gap-3 px-4 pt-6 pb-5 md:px-10 md:pt-8 md:pb-8">
          <h2 className="text-mobile-title-4 text-text-primary md:text-desktop-title-4 font-semibold">
            {String(t("modals.unlock_pdf.heading"))}
          </h2>

          <div className="flex items-center gap-3">
            <GuruFileBadge />
            <div className="min-w-0">
              <p className="text-body-emph text-text-primary truncate">
                {file.name}
              </p>
              <p className="text-caption-overline text-text-disabled uppercase">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>

          <UnlockPdfProgress />

          {isPasswordFormVisible ? (
            <div className="flex flex-col gap-3 pt-1">
              <Input
                data-testid="unlock-pdf-password-input"
                value={password}
                type={isPasswordVisible ? "text" : "password"}
                onChange={(event) => handlePasswordChange(event.target.value)}
                placeholder={String(
                  t("modals.unlock_pdf.password_placeholder")
                )}
                autoFocus
                isError={Boolean(passwordError)}
                errorMessage={passwordError ?? undefined}
                rightIcon={
                  <button
                    type="button"
                    className="text-text-secondary flex cursor-pointer items-center"
                    onClick={() => setIsPasswordVisible((prev) => !prev)}
                    aria-label={String(
                      isPasswordVisible
                        ? t("modals.unlock_pdf.hide_password")
                        : t("modals.unlock_pdf.show_password")
                    )}
                  >
                    {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                }
                bg="filled"
                size="dense"
              />

              <div className="flex gap-3">
                <Button
                  className="h-10 flex-1 rounded-xl max-md:h-8"
                  variant="outlined"
                  color="primary"
                  size="md"
                  onClick={hidePasswordForm}
                  data-testid="unlock-pdf-back"
                >
                  {String(t("modals.unlock_pdf.back"))}
                </Button>
                <Button
                  className="h-10 flex-1 rounded-xl max-md:h-8"
                  variant="filled"
                  color="primary"
                  size="md"
                  onClick={handleSubmit}
                  disabled={!password.trim()}
                  data-testid="unlock-pdf-submit"
                >
                  {String(
                    isSubmitting
                      ? t("modals.unlock_pdf.unlocking")
                      : t("modals.unlock_pdf.unlock")
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              className="mt-2 self-center"
              variant="text"
              color="primary"
              size="md"
              onClick={showPasswordForm}
              data-testid="unlock-pdf-know-password"
            >
              {String(t("modals.unlock_pdf.know_password"))}
            </Button>
          )}
        </div>
      </div>
    </BaseModal>
  );
};

const formatFileSize = (fileSize: number): string => {
  if (fileSize >= 1_000_000) {
    return `${(fileSize / 1_000_000).toFixed(2)} MB`;
  }

  if (fileSize >= 1_000) {
    return `${(fileSize / 1_000).toFixed(2)} KB`;
  }

  return `${fileSize} B`;
};

const GuruFileBadge: FC = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
    aria-hidden="true"
  >
    <path
      d="M26.1303 3H9.20269C8.16528 3 7.32227 3.84962 7.32227 4.9006V35.0994C7.32227 36.1492 8.16528 37 9.20269 37H31.7727C32.8123 37 33.6531 36.1492 33.6531 35.0994V10.6024L26.1303 3ZM26.1303 5.68713L30.9943 10.6024H26.1303V5.68713ZM31.7731 35.0994H9.20269V4.9006H24.2495V10.6024C24.2495 11.6522 25.0906 12.503 26.1299 12.503H31.7727L31.7731 35.0994Z"
      fill="#D2294B"
    />
    <g clipPath="url(#unlock-file-badge-clip)">
      <path
        d="M24.999 16.9118C24.424 17.0736 23.854 17.2534 23.2728 17.4615C23.0451 17.0967 22.7738 16.7962 22.4589 16.5599C21.9623 16.1862 21.3786 16 20.709 16C19.8341 16 19.1297 16.3416 18.5958 17.0274C18.4552 17.2072 18.3332 17.4075 18.2311 17.6271C18.1677 17.762 18.1129 17.9045 18.0631 18.0548L18.2311 16.217H16.0768L14.999 28H17.1533L17.8267 20.6451L17.8715 20.1443C17.9922 19.4906 18.3257 18.9897 18.6033 18.6404C18.9492 18.2063 19.3973 17.988 19.9486 17.988C20.3954 17.988 20.7725 18.128 21.0824 18.4041C20.5883 18.7136 20.154 19.131 19.7333 19.5458C18.7078 20.5565 18.037 22.4623 18.5858 23.8673C18.7464 24.2783 19.1596 24.7932 19.4807 24.9936C20.3481 25.533 21.6387 25.3506 22.4589 24.7329C22.9555 24.3592 23.3438 23.8275 23.625 23.1366C23.9051 22.4456 24.0457 21.616 24.0457 20.6464C24.0457 19.9542 23.9723 19.3339 23.8291 18.7842C24.2125 18.6045 24.6045 18.4439 24.999 18.2962V16.9118ZM21.5777 22.5599C21.3985 23.0004 21.0637 23.4473 20.5497 23.4191C20.3693 23.4101 20.1926 23.3215 20.1079 23.1494C20.0469 23.0235 20.0345 22.8784 20.0382 22.7372C20.0644 21.9461 20.541 21.2256 21.0824 20.7016C21.3139 20.4795 21.5516 20.2637 21.798 20.0582C21.8167 20.2419 21.8267 20.4371 21.8267 20.6464C21.8267 21.5492 21.7868 22.0398 21.5777 22.5599Z"
        fill="#D2284B"
      />
    </g>
    <defs>
      <clipPath id="unlock-file-badge-clip">
        <rect
          width="10"
          height="12"
          fill="white"
          transform="translate(14.999 16)"
        />
      </clipPath>
    </defs>
  </svg>
);

const EyeIcon: FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M10 4.16663C5.83333 4.16663 2.275 6.75829 0.833328 10.4166C2.275 14.075 5.83333 16.6666 10 16.6666C14.1667 16.6666 17.725 14.075 19.1667 10.4166C17.725 6.75829 14.1667 4.16663 10 4.16663ZM10 14.5833C7.7 14.5833 5.83333 12.7166 5.83333 10.4166C5.83333 8.11663 7.7 6.24996 10 6.24996C12.3 6.24996 14.1667 8.11663 14.1667 10.4166C14.1667 12.7166 12.3 14.5833 10 14.5833ZM10 7.91663C8.61666 7.91663 7.5 9.03329 7.5 10.4166C7.5 11.8 8.61666 12.9166 10 12.9166C11.3833 12.9166 12.5 11.8 12.5 10.4166C12.5 9.03329 11.3833 7.91663 10 7.91663Z"
      fill="currentColor"
    />
  </svg>
);

const EyeOffIcon: FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M2.42408 1.25012L1.25 2.42421L4.0575 5.23171C2.73333 6.20921 1.65833 7.53329 0.833333 9.16679C2.275 12.8251 5.83333 15.4168 10 15.4168C11.6167 15.4168 13.1333 15.0251 14.4667 14.3335L17.5758 17.4418L18.75 16.2677L2.42408 1.25012ZM10 5.41679C11.7917 5.41679 13.25 6.87512 13.25 8.66679C13.25 9.10012 13.1583 9.51679 13 9.89179L8.77583 5.66679C9.15 5.50845 9.56667 5.41679 10 5.41679ZM3.3075 9.16679C3.9075 8.06679 4.6825 7.14179 5.6325 6.48345L7.33333 8.18345C7.28333 8.34179 7.25 8.50012 7.25 8.66679C7.25 10.4585 8.70833 11.9168 10.5 11.9168C10.6667 11.9168 10.825 11.8835 10.9833 11.8335L12.6833 13.5335C11.8667 13.8335 10.9583 14.0001 10 14.0001C7.19167 14.0001 4.75833 12.0501 3.3075 9.16679ZM10.5 8.66679C10.5 8.82512 10.4667 8.98345 10.4083 9.12512L9.54167 8.25845C9.68333 8.20012 9.84167 8.16679 10 8.16679C10.275 8.16679 10.5 8.39179 10.5 8.66679Z"
      fill="currentColor"
    />
  </svg>
);
