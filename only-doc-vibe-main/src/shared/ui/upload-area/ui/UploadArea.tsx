"use client";

import { Button } from "@universe-forma/ui-pes";
import type { FC } from "react";
import { ReactComponent as UploadIcon } from "@public/assets/icons/upload.svg?react";
import uploadIllustration from "@public/assets/hero/upload-illustration.svg?url";
import uploadIllustrationHover from "@public/assets/hero/upload-illustration-hover.svg?url";
import unlockIllustration from "@public/assets/hero/unlock-illustration.svg?url";

import { cn } from "../../../lib/utils/cn";
import { Image } from "../../image";
import type { IUploadAreaProps } from "../model/types";
import { useUploadArea } from "../lib/useUploadArea";

export const UploadArea: FC<IUploadAreaProps> = ({
  buttonLabel,
  supportedFormatsText,
  maxSizeText,
  dropText,
  onFileUpload,
  validationError,
  setValidationError,
  acceptedFormats,
  multiple = false,
  showUnlockIllustration = false,
}) => {
  const isUnlockPdf = showUnlockIllustration;
  const {
    fileInputRef,
    isHovered,
    isDragOver,
    handleClick,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    handleMouseEnter,
    handleMouseLeave,
    acceptString,
  } = useUploadArea({
    onFileUpload,
    acceptedFormats,
    setValidationError,
  });

  const isActive = isHovered || isDragOver;

  return (
    <div
      className="w-full rounded-[40px] bg-white p-3 shadow-[0px_4px_40px_0px_rgba(255,221,45,0.08)] [--color-primary-dark:#E8CA3A]"
      role="region"
      aria-label="File upload area"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptString}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      <div
        className={cn(
          "flex cursor-pointer flex-col items-center gap-5 rounded-[28px] border border-dashed px-5 pt-8 pb-5 transition-colors duration-300",
          "md:rounded-[32px] md:border-2 md:p-8 md:duration-500 md:ease-in-out md:will-change-[border-color,background-color]",
          isDragOver ? "border-[var(--color-primary)]" : "border-black/15",
          isDragOver
            ? "md:border-[var(--color-primary)] md:bg-[var(--color-primary)]/10"
            : "md:border-black/15 md:hover:border-[var(--color-primary)]/70 md:hover:bg-[var(--color-primary)]/5"
        )}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={dropText}
      >
        {/* Illustration — desktop only */}
        <div
          className={cn(
            "relative hidden md:block",
            isUnlockPdf ? "h-[177px] w-[151px]" : "h-[160px] w-[160px]"
          )}
        >
          {isUnlockPdf ? (
            <Image
              src={unlockIllustration}
              alt="Unlock PDF illustration"
              className="h-full w-full object-contain"
            />
          ) : (
            <>
              <Image
                src={uploadIllustration}
                alt=""
                className={cn(
                  "absolute inset-0 h-full w-full object-contain transition-all duration-500 ease-out",
                  isActive ? "scale-95 opacity-0" : "scale-100 opacity-100"
                )}
              />
              <Image
                src={uploadIllustrationHover}
                alt=""
                className={cn(
                  "absolute inset-0 h-full w-full object-contain transition-all duration-500 ease-out",
                  isActive ? "scale-100 opacity-100" : "scale-110 opacity-0"
                )}
              />
            </>
          )}
        </div>

        {/* Title + description */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-mobile-title-4 lg:text-desktop-title-4 text-center font-semibold text-black/87">
            {dropText}
          </span>
          <div className="flex flex-col items-center gap-1">
            <p className="text-body text-center text-black/60">
              {supportedFormatsText}
            </p>
            <p className="text-body text-center text-black/60">{maxSizeText}</p>
          </div>
        </div>

        {/* CTA button: 220px wide, primary filled */}
        <Button
          variant="filled"
          size="lg"
          color="primary"
          className="w-full md:w-[220px]"
          rightIcon={
            <UploadIcon
              width={18}
              height={18}
              className="block h-[18px] w-[18px]"
            />
          }
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          {buttonLabel}
        </Button>
      </div>

      {validationError && (
        <p className="text-error-main text-caption mt-2 text-center">
          {validationError}
        </p>
      )}
    </div>
  );
};
