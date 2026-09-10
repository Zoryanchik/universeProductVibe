import type { FC, PropsWithChildren } from "react";
import closeIcon from "@public/assets/modal/close-icon.svg?url";
import { cn } from "@universe-forma/ui-pes";

import { useDisableScroll } from "../../lib/ui/useDisableScroll";
import { closeModal } from "../../lib/modals/modals-store";
import type { EModalsTypes } from "../../constants/modals-keys";
import { useWaitTimeout } from "../../lib/utils/useWaitTimeout";

interface IBaseModalProps extends PropsWithChildren {
  modalType: EModalsTypes;
  rootClassName?: string;
  className?: string;
  canClose?: boolean;
  "data-testid"?: string;
  closeTestId?: string;
  isScrollDisabled?: boolean;
  onClose?: () => void;
  delayClose?: number;
  headerTitle?: string;
  headerSubtitle?: string;
  /** "center" (default) keeps the existing centred layout; "left" matches the dashboard modal Figma design */
  headerAlign?: "center" | "left";
}

export const BaseModal: FC<IBaseModalProps> = ({
  rootClassName,
  className,
  children,
  canClose = true,
  modalType,
  "data-testid": dataTestId,
  closeTestId,
  isScrollDisabled = true,
  onClose,
  delayClose,
  headerTitle,
  headerSubtitle,
  headerAlign = "center",
}) => {
  useDisableScroll({ isScrollDisabled });
  const showCloseButton = useWaitTimeout(delayClose || 0);

  const handleClose = () => {
    onClose?.();
    closeModal(modalType);
  };

  return (
    <div
      className={cn(
        "bg-common-black/30 fixed inset-0 z-100 flex h-dvh w-full items-center justify-center",
        rootClassName
      )}
    >
      <div
        data-testid={dataTestId}
        className={cn(
          "bg-bg-white-bg relative max-h-[90dvh] max-w-[90%] overflow-y-auto rounded-[20px] shadow-[0_0_12px_-8px_rgba(0,0,0,0.08),0_20px_32px_0_rgba(0,0,0,0.16)] max-md:max-h-[90dvh]",
          {
            "pt-10":
              headerAlign === "center" &&
              canClose &&
              showCloseButton &&
              !(headerTitle || headerSubtitle),
          },
          className
        )}
      >
        {/* Left-aligned header (Figma dashboard modals) */}
        {headerAlign === "left" && (headerTitle || headerSubtitle) && (
          <div className="flex items-start gap-3 px-5 pt-5 pb-3">
            <div className="flex min-h-[52px] min-w-0 flex-1 flex-col justify-center">
              {headerTitle && (
                <h2 className="text-text-primary text-2xl leading-[30px] font-semibold">
                  {headerTitle}
                </h2>
              )}
              {headerSubtitle && (
                <p className="text-text-secondary mt-0.5 truncate text-sm leading-[18px]">
                  {headerSubtitle}
                </p>
              )}
            </div>
            {canClose && showCloseButton && (
              <button
                data-testid={closeTestId}
                type="button"
                className="text-text-disabled flex shrink-0 cursor-pointer items-center justify-center rounded-xl p-3 transition-colors hover:bg-[rgba(0,0,0,0.04)]"
                onClick={handleClose}
              >
                <img src={closeIcon} alt="Close" />
              </button>
            )}
          </div>
        )}

        {/* Centred header (legacy / other modals) */}
        {headerAlign === "center" && (
          <div className="flex items-start p-5 pb-3">
            <div className="flex w-full flex-col items-center self-stretch">
              {headerTitle && (
                <h2 className="text-mobile-title-4 text-text-primary text-center">
                  {headerTitle}
                </h2>
              )}
              {headerSubtitle && (
                <div className="text-body-2 text-text-secondary text-center">
                  {headerSubtitle}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legacy absolute close button (center mode only) */}
        {headerAlign === "center" && canClose && showCloseButton && (
          <button
            data-testid={closeTestId}
            className="absolute end-5 top-5 flex cursor-pointer items-center justify-center gap-2 rounded-xl p-2"
            onClick={handleClose}
          >
            <img src={closeIcon} alt="Close" />
          </button>
        )}

        {children}
      </div>
    </div>
  );
};
